package com.spring.bioMedical.service;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.spring.bioMedical.dto.PrescriptionDto;
import com.spring.bioMedical.dto.PrescriptionRequest;
import com.spring.bioMedical.entity.Appointment;
import com.spring.bioMedical.entity.Prescription;
import com.spring.bioMedical.entity.User;
import com.spring.bioMedical.exception.ApiException;
import com.spring.bioMedical.repository.AppointmentRepository;
import com.spring.bioMedical.repository.PrescriptionRepository;

/**
 * Visit notes and prescriptions. The treating doctor writes them when finishing a confirmed visit
 * (which marks it completed) and can correct them later; the patient, the doctor and admins can read
 * them and download a PDF.
 */
@Service
public class PrescriptionService {

	private final PrescriptionRepository prescriptions;
	private final AppointmentRepository appointments;
	private final NotificationService notifications;

	public PrescriptionService(PrescriptionRepository prescriptions, AppointmentRepository appointments,
			NotificationService notifications) {
		this.prescriptions = prescriptions;
		this.appointments = appointments;
		this.notifications = notifications;
	}

	/** Creates or replaces the prescription; a confirmed visit becomes COMPLETED. */
	@Transactional
	public PrescriptionDto save(User doctor, Long appointmentId, PrescriptionRequest request) {
		Appointment appointment = appointments.findById(appointmentId)
				.filter(a -> doctor.getId().equals(a.getDoctorId()))
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Appointment not found"));
		String status = appointment.getStatus() == null ? Appointment.PENDING : appointment.getStatus();
		if (!Appointment.CONFIRMED.equals(status) && !Appointment.COMPLETED.equals(status)) {
			throw new ApiException(HttpStatus.BAD_REQUEST,
					"Confirm the appointment first. Prescriptions are written for confirmed or completed visits.");
		}
		String followUp = blankToNull(request.followUpDate());
		if (followUp != null) {
			try {
				if (!LocalDate.parse(followUp).isAfter(LocalDate.parse(appointment.getDate()))) {
					throw new ApiException(HttpStatus.BAD_REQUEST, "The follow-up date must be after the visit.");
				}
			} catch (DateTimeParseException e) {
				throw new ApiException(HttpStatus.BAD_REQUEST, "Please choose a valid follow-up date.");
			}
		}

		Prescription p = prescriptions.findByAppointmentId(appointmentId).orElseGet(Prescription::new);
		p.setAppointmentId(appointmentId);
		p.setDiagnosis(request.diagnosis().trim());
		p.setNotes(blankToNull(request.notes()));
		p.setFollowUpDate(followUp);
		p.getMedicines().clear();
		List<PrescriptionRequest.MedicineLine> lines = request.medicines() == null ? List.of() : request.medicines();
		for (PrescriptionRequest.MedicineLine line : lines) {
			Prescription.Medicine m = new Prescription.Medicine();
			m.setName(line.name().trim());
			m.setDosage(blankToNull(line.dosage()));
			m.setFrequency(blankToNull(line.frequency()));
			m.setDurationDays(line.durationDays());
			p.getMedicines().add(m);
		}
		p = prescriptions.save(p);

		boolean firstTime = !Appointment.COMPLETED.equals(appointment.getStatus());
		appointment.setHasPrescription(true);
		appointment.setStatus(Appointment.COMPLETED);
		appointments.save(appointment);
		if (firstTime) {
			notifications.statusChanged(appointment, false);
		}
		return PrescriptionDto.of(p, appointment);
	}

	/** The prescription for an appointment, if this user may see it. */
	@Transactional(readOnly = true)
	public PrescriptionDto get(User viewer, Long appointmentId) {
		Appointment appointment = appointments.findById(appointmentId)
				.filter(a -> canView(viewer, a))
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Appointment not found"));
		Prescription p = prescriptions.findByAppointmentId(appointmentId)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "No prescription has been written for this visit yet."));
		return PrescriptionDto.of(p, appointment);
	}

	private static boolean canView(User viewer, Appointment a) {
		return switch (viewer.getRole()) {
			case "ROLE_ADMIN" -> true;
			case "ROLE_DOCTOR" -> viewer.getId().equals(a.getDoctorId());
			default -> viewer.getEmail().equalsIgnoreCase(a.getEmail());
		};
	}

	private static String blankToNull(String s) {
		return s == null || s.isBlank() ? null : s.trim();
	}
}
