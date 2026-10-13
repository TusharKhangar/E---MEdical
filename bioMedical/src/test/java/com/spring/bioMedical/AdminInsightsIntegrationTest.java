package com.spring.bioMedical;

import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
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
import com.spring.bioMedical.entity.User;
import com.spring.bioMedical.repository.AppointmentRepository;
import com.spring.bioMedical.repository.UserRepository;

/** Admin analytics numbers and the server-side search behind the admin tables. */
@SpringBootTest
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class AdminInsightsIntegrationTest {

	private static final String PASSWORD = "Correct-Horse-Battery-42";

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private AppointmentRepository appointmentRepository;

	@Autowired
	private PasswordEncoder passwordEncoder;

	private String adminToken;
	private User cardio;
	private User derma;
	private final LocalDate today = LocalDate.now();

	@BeforeEach
	void setUp() throws Exception {
		appointmentRepository.deleteAll();
		userRepository.deleteAll();
		createUser("admin@test.com", "Ada", "Admin", "ROLE_ADMIN", null);
		cardio = createUser("heart@test.com", "Asha", "Rao", "ROLE_DOCTOR", "Cardiology");
		derma = createUser("skin@test.com", "Vikram", "Shah", "ROLE_DOCTOR", "Dermatology");
		createUser("p1@test.com", "Priya", "Nair", "ROLE_USER", null);
		createUser("p2@test.com", "Rahul", "Mehta", "ROLE_USER", null);
		adminToken = login("admin@test.com");

		appointment("Priya Nair", cardio, today.minusDays(3), "10:00", Appointment.COMPLETED);
		appointment("Priya Nair", cardio, today.minusDays(3), "11:00", Appointment.CANCELLED);
		appointment("Rahul Mehta", cardio, today.minusDays(1), "10:00", Appointment.COMPLETED);
		appointment("Rahul Mehta", derma, today.plusDays(2), "15:00", Appointment.CONFIRMED);
		// Outside a 7-day window
		appointment("Rahul Mehta", derma, today.minusDays(40), "09:00", Appointment.COMPLETED);
	}

	@Test
	void analyticsGroupsTheChosenRange() throws Exception {
		mockMvc.perform(get("/api/admin/analytics?days=7").header("Authorization", "Bearer " + adminToken))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.total").value(4))
				.andExpect(jsonPath("$.completionRate").value(66.7))
				.andExpect(jsonPath("$.cancellationRate").value(25.0))
				// 7 days back including today, plus 14 ahead, with zero-filled days
				.andExpect(jsonPath("$.perDay", hasSize(21)))
				.andExpect(jsonPath("$.perDepartment[0].label").value("Cardiology"))
				.andExpect(jsonPath("$.perDepartment[0].count").value(3))
				.andExpect(jsonPath("$.topDoctors[0].doctorName").value("Dr. Asha Rao"))
				.andExpect(jsonPath("$.topDoctors[0].completed").value(2))
				.andExpect(jsonPath("$.topDoctors[0].cancelled").value(1));
	}

	@Test
	void analyticsIsAdminOnlyAndValidatesTheRange() throws Exception {
		mockMvc.perform(get("/api/admin/analytics?days=0").header("Authorization", "Bearer " + adminToken))
				.andExpect(status().isBadRequest());
		mockMvc.perform(get("/api/admin/analytics").header("Authorization", "Bearer " + login("p1@test.com")))
				.andExpect(status().isForbidden());
	}

	@Test
	void appointmentSearchFiltersAndPages() throws Exception {
		mockMvc.perform(get("/api/admin/appointments/search?size=2").header("Authorization", "Bearer " + adminToken))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.totalElements").value(5))
				.andExpect(jsonPath("$.totalPages").value(3))
				.andExpect(jsonPath("$.content", hasSize(2)))
				// Newest first
				.andExpect(jsonPath("$.content[0].date").value(today.plusDays(2).toString()));

		mockMvc.perform(get("/api/admin/appointments/search?q=RAHUL&status=COMPLETED")
				.header("Authorization", "Bearer " + adminToken))
				.andExpect(jsonPath("$.totalElements").value(2));

		mockMvc.perform(get("/api/admin/appointments/search?q=derma&from=" + today)
				.header("Authorization", "Bearer " + adminToken))
				.andExpect(jsonPath("$.totalElements").value(1))
				.andExpect(jsonPath("$.content[0].time").value("15:00"));

		mockMvc.perform(get("/api/admin/appointments/search?doctorId=" + cardio.getId())
				.header("Authorization", "Bearer " + adminToken))
				.andExpect(jsonPath("$.totalElements").value(3));
	}

	@Test
	void accountSearchByRoleAndText() throws Exception {
		mockMvc.perform(get("/api/admin/accounts?role=DOCTOR&q=cardio").header("Authorization", "Bearer " + adminToken))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.content[*].email", contains("heart@test.com")));

		mockMvc.perform(get("/api/admin/accounts?role=USER&q=priya nair").header("Authorization", "Bearer " + adminToken))
				.andExpect(jsonPath("$.totalElements").value(1));

		mockMvc.perform(get("/api/admin/accounts?role=USER").header("Authorization", "Bearer " + adminToken))
				.andExpect(jsonPath("$.content[*].firstName", contains("Priya", "Rahul")))
				// Never leak password hashes in a list
				.andExpect(jsonPath("$.content[0].password").doesNotExist());

		mockMvc.perform(get("/api/admin/accounts?role=ROOT").header("Authorization", "Bearer " + adminToken))
				.andExpect(status().isBadRequest());
	}

	private void appointment(String name, User doctor, LocalDate date, String time, String status) {
		Appointment a = new Appointment();
		a.setName(name);
		a.setEmail(name.split(" ")[0].equals("Priya") ? "p1@test.com" : "p2@test.com");
		a.setDoctorId(doctor.getId());
		a.setDoctorName("Dr. " + doctor.getFirstName() + " " + doctor.getLastName());
		a.setDepartment(doctor.getSpecialization());
		a.setDate(date.toString());
		a.setTime(time);
		a.setStatus(status);
		appointmentRepository.save(a);
	}

	private User createUser(String email, String first, String last, String role, String specialization) {
		User user = new User();
		user.setEmail(email);
		user.setFirstName(first);
		user.setLastName(last);
		user.setRole(role);
		user.setEnabled(true);
		user.setPassword(passwordEncoder.encode(PASSWORD));
		user.setSpecialization(specialization);
		return userRepository.save(user);
	}

	private String login(String email) throws Exception {
		String body = mockMvc.perform(post("/api/login").contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(Map.of("username", email, "password", PASSWORD))))
				.andExpect(status().isOk())
				.andReturn().getResponse().getContentAsString();
		return objectMapper.readTree(body).get("jwt").asText();
	}
}
