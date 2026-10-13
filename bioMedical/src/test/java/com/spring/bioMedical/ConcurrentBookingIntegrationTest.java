package com.spring.bioMedical;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;

import com.spring.bioMedical.entity.Appointment;
import com.spring.bioMedical.entity.User;
import com.spring.bioMedical.exception.ApiException;
import com.spring.bioMedical.repository.AppointmentRepository;
import com.spring.bioMedical.repository.UserRepository;
import com.spring.bioMedical.service.AppointmentServiceImplementation;

/**
 * Many people pressing "Book" at the same instant. Found by a realistic-data load test, where 20
 * simultaneous requests for one slot produced 4 bookings.
 */
@SpringBootTest
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class ConcurrentBookingIntegrationTest {

	private static final int THREADS = 16;

	@Autowired
	private AppointmentServiceImplementation appointments;

	@Autowired
	private AppointmentRepository appointmentRepository;

	@Autowired
	private UserRepository userRepository;

	private final String date = LocalDate.now().plusDays(4).toString();

	@BeforeEach
	void setUp() {
		appointmentRepository.deleteAll();
		userRepository.deleteAll();
	}

	@Test
	void manyPatientsSameSlotOnlyOneWins() throws Exception {
		User doctor = save("doc@test.com", "ROLE_DOCTOR");
		List<User> patients = new ArrayList<>();
		for (int i = 0; i < THREADS; i++) {
			patients.add(save("p" + i + "@test.com", "ROLE_USER"));
		}

		int booked = runAtOnce(patients.stream()
				.<Callable<Boolean>>map(p -> () -> tryBook(p, doctor, "10:00"))
				.toList());

		assertThat(booked).isEqualTo(1);
		assertThat(appointmentRepository.findByDoctorIdOrderByDateDescTimeDesc(doctor.getId())).hasSize(1);
	}

	@Test
	void onePatientManyDoctorsSameTimeOnlyOneWins() throws Exception {
		User patient = save("p@test.com", "ROLE_USER");
		List<User> doctors = new ArrayList<>();
		for (int i = 0; i < THREADS; i++) {
			doctors.add(save("d" + i + "@test.com", "ROLE_DOCTOR"));
		}

		int booked = runAtOnce(doctors.stream()
				.<Callable<Boolean>>map(d -> () -> tryBook(patient, d, "11:00"))
				.toList());

		assertThat(booked).isEqualTo(1);
		assertThat(appointmentRepository.findByEmailOrderByDateDescTimeDesc("p@test.com")).hasSize(1);
	}

	private boolean tryBook(User patient, User doctor, String time) {
		try {
			Appointment a = appointments.book(patient, doctor, date, time, "race");
			return a.getId() != null;
		} catch (ApiException e) {
			return false;
		}
	}

	/** Starts every task at the same moment and counts the ones that returned true. */
	private static int runAtOnce(List<Callable<Boolean>> tasks) throws Exception {
		ExecutorService pool = Executors.newFixedThreadPool(tasks.size());
		CountDownLatch start = new CountDownLatch(1);
		try {
			List<Future<Boolean>> results = new ArrayList<>();
			for (Callable<Boolean> task : tasks) {
				results.add(pool.submit(() -> {
					start.await();
					return task.call();
				}));
			}
			start.countDown();
			int wins = 0;
			for (Future<Boolean> f : results) {
				if (f.get()) {
					wins++;
				}
			}
			return wins;
		} finally {
			pool.shutdownNow();
		}
	}

	private User save(String email, String role) {
		User u = new User();
		u.setEmail(email);
		u.setFirstName("Test");
		u.setLastName("User");
		u.setRole(role);
		u.setEnabled(true);
		u.setPassword("x");
		u.setSpecialization("ROLE_DOCTOR".equals(role) ? "General Medicine" : null);
		return userRepository.save(u);
	}
}
