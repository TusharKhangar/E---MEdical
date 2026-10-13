package com.spring.bioMedical.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.spring.bioMedical.entity.User;
import com.spring.bioMedical.entity.Appointment;
import com.spring.bioMedical.exception.ApiException;
import com.spring.bioMedical.repository.AdminRepository;
import com.spring.bioMedical.repository.AppointmentRepository;

@Service
public class AppointmentServiceImplementation  {

	private static final Logger logger = LoggerFactory.getLogger(AppointmentServiceImplementation.class);

	/** Clinic opening hours: hourly slots from 09:00 to 17:00, closed 13:00-14:00 for lunch. */
	public static final List<String> TIME_SLOTS = List.of("09:00", "10:00", "11:00", "12:00", "14:00", "15:00",
			"16:00", "17:00");

	/** How far ahead patients can book. */
	public static final int BOOKING_WINDOW_DAYS = 90;

	private final AppointmentRepository appointmentRepository;
	private final AdminRepository userRepository;

	@Autowired
	public AppointmentServiceImplementation(AppointmentRepository appointmentRepository, AdminRepository userRepository)
	{
		this.appointmentRepository = appointmentRepository;
		this.userRepository = userRepository;
	}


	public void save(Appointment app)
	{

		appointmentRepository.save(app);
	}


	public List<Appointment> findAll() {
		return appointmentRepository.findAllByOrderByDateDescTimeDesc();
	}

	public List<Appointment> findByPatientEmail(String email) {
		return appointmentRepository.findByEmailOrderByDateDescTimeDesc(email);
	}

	public List<Appointment> findByDoctorId(Long doctorId) {
		return appointmentRepository.findByDoctorIdOrderByDateDescTimeDesc(doctorId);
	}

	public Optional<Appointment> findById(Long id) {
		logger.info("Finding appointment by ID: {}", id);
		return appointmentRepository.findById(id);
	}

	public void deleteById(Long id) {
		logger.info("Deleting appointment by ID: {}", id);
		appointmentRepository.deleteById(id);
	}

	/** Free slots for a doctor on a date; past slots for today are left out. */
	public List<String> availableSlots(Long doctorId, String date) {
		LocalDate day = parseDate(date);
		Set<String> taken = Set.copyOf(appointmentRepository.findTakenTimes(doctorId, date));
		return TIME_SLOTS.stream()
				.filter(slot -> !taken.contains(slot))
				.filter(slot -> LocalDateTime.of(day, LocalTime.parse(slot)).isAfter(LocalDateTime.now()))
				.toList();
	}

	/**
	 * Books a slot for the patient with the doctor after checking the date, time and that the slot is free.
	 */
	@Transactional
	public Appointment book(User patient, User doctor, String date, String time, String description) {
		LocalDate day = parseDate(date);
		LocalDate today = LocalDate.now();
		if (day.isBefore(today) || day.isAfter(today.plusDays(BOOKING_WINDOW_DAYS))) {
			throw new ApiException(HttpStatus.BAD_REQUEST,
					"Please choose a date between today and " + BOOKING_WINDOW_DAYS + " days from now.");
		}
		if (!TIME_SLOTS.contains(time)) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "Please choose one of the available time slots.");
		}
		if (!LocalDateTime.of(day, LocalTime.parse(time)).isAfter(LocalDateTime.now())) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "That time has already passed. Please pick a later slot.");
		}

		// Two people clicking the same slot at the same moment would both pass the checks below and both
		// insert. Locking the doctor's and the patient's rows (SELECT ... FOR UPDATE, in id order to avoid
		// deadlocks) makes concurrent bookings for either of them wait their turn until this one commits.
		userRepository.lockForBooking(List.of(doctor.getId(), patient.getId()));

		if (appointmentRepository.isSlotTaken(doctor.getId(), date, time)) {
			throw new ApiException(HttpStatus.CONFLICT, "That slot is already booked. Please choose another time.");
		}
		if (appointmentRepository.patientHasAppointmentAt(patient.getEmail(), date, time)) {
			throw new ApiException(HttpStatus.CONFLICT,
					"You already have an appointment at " + time + " on that day. Please choose another time.");
		}

		Appointment appointment = new Appointment();
		appointment.setName(patient.getFirstName() + " " + patient.getLastName());
		appointment.setEmail(patient.getEmail());
		appointment.setDoctorId(doctor.getId());
		appointment.setDoctorName("Dr. " + doctor.getFirstName() + " " + doctor.getLastName());
		appointment.setDepartment(doctor.getSpecialization());
		appointment.setDate(date);
		appointment.setTime(time);
		appointment.setDescription(description);
		appointment.setStatus(Appointment.PENDING);
		appointment.setRegtime(LocalDateTime.now().withNano(0).toString());
		return appointmentRepository.save(appointment);
	}

	/**
	 * Moves an appointment to a new status. Finished (completed or cancelled) appointments cannot change,
	 * and an appointment must be confirmed before it can be completed.
	 */
	@Transactional
	public Appointment changeStatus(Appointment appointment, String newStatus) {
		if (!appointment.isActive()) {
			throw new ApiException(HttpStatus.BAD_REQUEST,
					"This appointment is already " + appointment.getStatus().toLowerCase() + ".");
		}
		boolean allowed = switch (newStatus) {
			case Appointment.CONFIRMED, Appointment.CANCELLED -> true;
			case Appointment.COMPLETED -> Appointment.CONFIRMED.equals(appointment.getStatus());
			default -> false;
		};
		if (!allowed) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "An appointment cannot move from "
					+ (appointment.getStatus() == null ? Appointment.PENDING : appointment.getStatus()) + " to "
					+ newStatus + ".");
		}
		appointment.setStatus(newStatus);
		return appointmentRepository.save(appointment);
	}

	public long countByStatus(String status) {
		return appointmentRepository.countByStatus(status);
	}

	public long count() {
		return appointmentRepository.count();
	}

	private static LocalDate parseDate(String date) {
		try {
			return LocalDate.parse(date);
		} catch (DateTimeParseException | NullPointerException e) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "Please choose a valid date.");
		}
	}
}
