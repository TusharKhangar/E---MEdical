package com.spring.bioMedical;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.spring.bioMedical.entity.Appointment;
import com.spring.bioMedical.entity.DoctorSchedule;
import com.spring.bioMedical.entity.User;
import com.spring.bioMedical.repository.AppointmentRepository;
import com.spring.bioMedical.repository.DoctorScheduleRepository;
import com.spring.bioMedical.repository.UserRepository;

/** The admin's Delete button: only accounts without appointments can go, so medical history is kept. */
@SpringBootTest
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class AccountDeletionIntegrationTest {

	private static final String PASSWORD = "Correct-Horse-Battery-42";

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

	@Autowired
	private UserRepository users;

	@Autowired
	private AppointmentRepository appointments;

	@Autowired
	private DoctorScheduleRepository schedules;

	@Autowired
	private PasswordEncoder passwordEncoder;

	private User admin;

	@BeforeEach
	void setUp() {
		appointments.deleteAll();
		schedules.deleteAll();
		users.deleteAll();
		admin = create("admin@test.com", "ROLE_ADMIN");
	}

	@Test
	void deletesAnAccountWithNoAppointments() throws Exception {
		User unused = create("unused@test.com", "ROLE_USER");
		mockMvc.perform(delete("/api/admin/users/" + unused.getId()).header("Authorization", "Bearer " + login("admin@test.com")))
				.andExpect(status().isNoContent());
		assertThat(users.findById(unused.getId())).isEmpty();
	}

	@Test
	void deletingADoctorAlsoRemovesTheirWeeklySchedule() throws Exception {
		User doctor = create("doc@test.com", "ROLE_DOCTOR");
		schedules.save(new DoctorSchedule(doctor.getId(), 1, true, "09:00", "17:00"));
		mockMvc.perform(delete("/api/admin/users/" + doctor.getId()).header("Authorization", "Bearer " + login("admin@test.com")))
				.andExpect(status().isNoContent());
		assertThat(schedules.findByDoctorIdOrderByDayOfWeek(doctor.getId())).isEmpty();
	}

	@Test
	void refusesAPatientWithAppointments() throws Exception {
		User patient = create("pat@test.com", "ROLE_USER");
		book("pat@test.com", 999L);
		mockMvc.perform(delete("/api/admin/users/" + patient.getId()).header("Authorization", "Bearer " + login("admin@test.com")))
				.andExpect(status().isConflict())
				.andExpect(content().string(containsString("Disable it instead")));
		assertThat(users.findById(patient.getId())).isPresent();
	}

	@Test
	void refusesADoctorWithAppointments() throws Exception {
		User doctor = create("doc@test.com", "ROLE_DOCTOR");
		book("someone@test.com", doctor.getId());
		mockMvc.perform(delete("/api/admin/users/" + doctor.getId()).header("Authorization", "Bearer " + login("admin@test.com")))
				.andExpect(status().isConflict());
		assertThat(users.findById(doctor.getId())).isPresent();
	}

	@Test
	void adminCannotDeleteThemselvesAndOthersCannotDeleteAtAll() throws Exception {
		mockMvc.perform(delete("/api/admin/users/" + admin.getId()).header("Authorization", "Bearer " + login("admin@test.com")))
				.andExpect(status().isBadRequest());

		User patient = create("pat@test.com", "ROLE_USER");
		mockMvc.perform(delete("/api/admin/users/" + admin.getId()).header("Authorization", "Bearer " + login("pat@test.com")))
				.andExpect(status().isForbidden());
		mockMvc.perform(delete("/api/admin/users/" + patient.getId())).andExpect(status().isUnauthorized());
		assertThat(users.findById(admin.getId())).isPresent();
	}

	private void book(String patientEmail, Long doctorId) {
		Appointment a = new Appointment();
		a.setName("Test Patient");
		a.setEmail(patientEmail);
		a.setDoctorId(doctorId);
		a.setDate("2030-01-10");
		a.setTime("10:00");
		a.setStatus("PENDING");
		appointments.save(a);
	}

	private User create(String email, String role) {
		User u = new User();
		u.setEmail(email);
		u.setFirstName("Test");
		u.setLastName("User");
		u.setRole(role);
		u.setEnabled(true);
		u.setPassword(passwordEncoder.encode(PASSWORD));
		return users.save(u);
	}

	private String login(String email) throws Exception {
		String body = mockMvc.perform(post("/api/login").contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(Map.of("username", email, "password", PASSWORD))))
				.andExpect(status().isOk())
				.andReturn().getResponse().getContentAsString();
		return objectMapper.readTree(body).get("jwt").asText();
	}
}
