package com.spring.bioMedical;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.clearInvocations;
import static org.mockito.Mockito.verify;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.test.annotation.DirtiesContext;

import com.spring.bioMedical.entity.Appointment;
import com.spring.bioMedical.entity.User;
import com.spring.bioMedical.repository.AppointmentRepository;
import com.spring.bioMedical.repository.UserRepository;
import com.spring.bioMedical.service.AppointmentServiceImplementation;
import com.spring.bioMedical.service.EmailService;
import com.spring.bioMedical.service.ReminderJob;

/** Who gets which e-mail when an appointment is booked, changes status, or is due tomorrow. */
@SpringBootTest
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class NotificationIntegrationTest {

	@MockBean
	private EmailService emailService;

	@Autowired
	private AppointmentServiceImplementation appointments;

	@Autowired
	private ReminderJob reminderJob;

	@Autowired
	private AppointmentRepository appointmentRepository;

	@Autowired
	private UserRepository userRepository;

	private User doctor;
	private User patient;
	private final LocalDate monday = LocalDate.now().plusDays(7).with(TemporalAdjusters.nextOrSame(DayOfWeek.MONDAY));

	@BeforeEach
	void setUp() {
		appointmentRepository.deleteAll();
		userRepository.deleteAll();
		doctor = createUser("doc@test.com", "ROLE_DOCTOR");
		patient = createUser("pat@test.com", "ROLE_USER");
		clearInvocations(emailService);
	}

	@Test
	void bookingEmailsPatientAndDoctorThenStatusChangesEmailTheRightPerson() {
		Appointment a = appointments.book(patient, doctor, monday.toString(), "10:00", "Back pain");
		assertThat(sent()).extracting(m -> m.getTo()[0] + " | " + m.getSubject()).containsExactlyInAnyOrder(
				"pat@test.com | E-Medical: Appointment request received",
				"doc@test.com | E-Medical: New appointment request");

		clearInvocations(emailService);
		appointments.changeStatus(a, Appointment.CONFIRMED);
		assertThat(sent()).singleElement().satisfies(m -> {
			assertThat(m.getTo()).containsExactly("pat@test.com");
			assertThat(m.getSubject()).contains("confirmed");
		});

		clearInvocations(emailService);
		appointments.changeStatus(a, Appointment.CANCELLED, true);
		assertThat(sent()).singleElement().satisfies(m -> {
			assertThat(m.getTo()).containsExactly("doc@test.com");
			assertThat(m.getSubject()).contains("cancelled by the patient");
		});
	}

	@Test
	void remindersGoOnceToActiveAppointmentsOnThatDayOnly() {
		LocalDate day = monday;
		save(day, "10:00", Appointment.PENDING, false);
		save(day, "11:00", Appointment.CONFIRMED, false);
		save(day, "12:00", Appointment.CANCELLED, false);
		save(day, "14:00", Appointment.CONFIRMED, true);
		save(day.plusDays(1), "10:00", Appointment.CONFIRMED, false);

		assertThat(reminderJob.sendRemindersFor(day)).isEqualTo(2);
		assertThat(sent()).hasSize(2).allSatisfy(m -> assertThat(m.getSubject()).contains("Reminder"));

		// Running again (a second instance, a restart) sends nothing new
		assertThat(reminderJob.sendRemindersFor(day)).isZero();
	}

	@Test
	void reschedulingResetsTheReminderSoTheNewDayGetsOne() {
		Appointment a = save(monday, "10:00", Appointment.CONFIRMED, true);
		appointments.reschedule(a, patient, doctor, monday.plusDays(1).toString(), "11:00");
		assertThat(reminderJob.sendRemindersFor(monday.plusDays(1))).isEqualTo(1);
	}

	private List<SimpleMailMessage> sent() {
		ArgumentCaptor<SimpleMailMessage> captor = ArgumentCaptor.forClass(SimpleMailMessage.class);
		verify(emailService, atLeastOnce()).sendEmail(captor.capture());
		return captor.getAllValues();
	}

	private Appointment save(LocalDate date, String time, String status, boolean reminded) {
		Appointment a = new Appointment();
		a.setName("Test User");
		a.setEmail(patient.getEmail());
		a.setDoctorId(doctor.getId());
		a.setDoctorName("Dr. Test User");
		a.setDate(date.toString());
		a.setTime(time);
		a.setStatus(status);
		a.setReminderSent(reminded);
		return appointmentRepository.save(a);
	}

	private User createUser(String email, String role) {
		User user = new User();
		user.setEmail(email);
		user.setFirstName("Test");
		user.setLastName("User");
		user.setRole(role);
		user.setEnabled(true);
		user.setPassword("not-used");
		user.setSpecialization("ROLE_DOCTOR".equals(role) ? "General Medicine" : null);
		return userRepository.save(user);
	}
}
