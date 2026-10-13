package com.spring.bioMedical.config;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.spring.bioMedical.entity.Appointment;
import com.spring.bioMedical.entity.User;
import com.spring.bioMedical.repository.AppointmentRepository;
import com.spring.bioMedical.repository.UserRepository;

/**
 * Fills an empty database with demo accounts and appointments so a fresh deploy can be tried at once.
 * Off by default; turn it on with {@code SEED_DEMO_DATA=true}. Does nothing if any account exists.
 */
@Component
@ConditionalOnProperty(name = "app.seed-demo-data", havingValue = "true")
public class DemoDataSeeder implements ApplicationRunner {

	private static final Logger logger = LoggerFactory.getLogger(DemoDataSeeder.class);

	/** Shared by all demo accounts; shown in the README. */
	public static final String DEMO_PASSWORD = "Demo@Clinic2025";

	private final UserRepository userRepository;
	private final AppointmentRepository appointmentRepository;
	private final PasswordEncoder passwordEncoder;

	public DemoDataSeeder(UserRepository userRepository, AppointmentRepository appointmentRepository,
			PasswordEncoder passwordEncoder) {
		this.userRepository = userRepository;
		this.appointmentRepository = appointmentRepository;
		this.passwordEncoder = passwordEncoder;
	}

	@Override
	public void run(ApplicationArguments args) {
		if (userRepository.count() > 0) {
			return;
		}
		String hash = passwordEncoder.encode(DEMO_PASSWORD);
		userRepository.save(user("admin@emedical.demo", "Asha", "Patel", "FEMALE", "ROLE_ADMIN", null, hash));
		User patient = userRepository.save(
				user("patient@emedical.demo", "Rahul", "Das", "MALE", "ROLE_USER", null, hash));
		User doctor = userRepository.save(
				user("doctor@emedical.demo", "Sarah", "Thomas", "FEMALE", "ROLE_DOCTOR", "General Medicine", hash));
		User cardiologist = userRepository.save(
				user("ananya.sharma@emedical.demo", "Ananya", "Sharma", "FEMALE", "ROLE_DOCTOR", "Cardiology", hash));
		userRepository.save(user("vikram.rao@emedical.demo", "Vikram", "Rao", "MALE", "ROLE_DOCTOR", "ENT", hash));
		userRepository.save(
				user("aditya.verma@emedical.demo", "Aditya", "Verma", "MALE", "ROLE_DOCTOR", "Pediatrics", hash));
		userRepository.save(
				user("neha.gupta@emedical.demo", "Neha", "Gupta", "FEMALE", "ROLE_DOCTOR", "Orthopedics", hash));

		LocalDate today = LocalDate.now();
		appointmentRepository.save(appointment(patient, doctor, today.plusDays(2), "10:00",
				"Persistent cough for two weeks", Appointment.CONFIRMED));
		appointmentRepository.save(appointment(patient, cardiologist, today.plusDays(5), "11:00",
				"Follow-up on blood pressure readings", Appointment.PENDING));
		appointmentRepository.save(appointment(patient, doctor, today.minusDays(10), "15:00",
				"Annual health check-up", Appointment.COMPLETED));
		logger.info("Demo data created. Sign in as admin@, doctor@ or patient@emedical.demo with the demo password.");
	}

	private static User user(String email, String first, String last, String gender, String role,
			String specialization, String hash) {
		User user = new User();
		user.setEmail(email);
		user.setFirstName(first);
		user.setLastName(last);
		user.setGender(gender);
		user.setRole(role);
		user.setSpecialization(specialization);
		user.setPhoneNumber("9876543210");
		user.setPassword(hash);
		user.setEnabled(true);
		return user;
	}

	private static Appointment appointment(User patient, User doctor, LocalDate date, String time, String reason,
			String status) {
		Appointment a = new Appointment();
		a.setName(patient.getFirstName() + " " + patient.getLastName());
		a.setEmail(patient.getEmail());
		a.setDoctorId(doctor.getId());
		a.setDoctorName("Dr. " + doctor.getFirstName() + " " + doctor.getLastName());
		a.setDepartment(doctor.getSpecialization());
		a.setDate(date.toString());
		a.setTime(time);
		a.setDescription(reason);
		a.setStatus(status);
		a.setRegtime(LocalDateTime.now().withNano(0).toString());
		return a;
	}
}
