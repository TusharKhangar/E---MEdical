package com.spring.bioMedical;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.time.LocalDate;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.spring.bioMedical.entity.User;
import com.spring.bioMedical.repository.AppointmentRepository;
import com.spring.bioMedical.repository.UserRepository;

/**
 * End-to-end API tests against an in-memory database: sign-up, onboarding a doctor, booking,
 * and who can see and change which appointments.
 */
@SpringBootTest
@AutoConfigureMockMvc
class AppointmentFlowIntegrationTest {

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

	private String tomorrow;

	@BeforeEach
	void setUp() {
		appointmentRepository.deleteAll();
		userRepository.deleteAll();
		createUser("admin@test.com", "Asha", "Patel", "ROLE_ADMIN", null);
		tomorrow = LocalDate.now().plusDays(1).toString();
	}

	@Test
	void patientSignsUpConfirmsEmailAndLogsInWithRole() throws Exception {
		mockMvc.perform(post("/api/register").contentType(MediaType.APPLICATION_JSON).content(json(Map.of(
				"email", "Rahul@Test.com", "firstName", "Rahul", "lastName", "Das",
				"phoneNumber", "9876543210", "gender", "MALE"))))
				.andExpect(status().isOk());

		User saved = userRepository.findByEmail("rahul@test.com").orElseThrow();
		assertThat(saved.getEnabled()).isFalse();

		// Logging in before choosing a password explains what to do
		mockMvc.perform(post("/api/login").contentType(MediaType.APPLICATION_JSON)
				.content(json(Map.of("username", "rahul@test.com", "password", "anything"))))
				.andExpect(status().isUnauthorized())
				.andExpect(content().string(containsString("confirm your e-mail")));

		mockMvc.perform(post("/api/confirmPassword").contentType(MediaType.APPLICATION_JSON)
				.content(json(Map.of("token", saved.getConfirmationToken(), "password", PASSWORD))))
				.andExpect(status().isOk());

		mockMvc.perform(post("/api/login").contentType(MediaType.APPLICATION_JSON)
				.content(json(Map.of("username", "RAHUL@test.com", "password", PASSWORD))))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.jwt").isNotEmpty())
				.andExpect(jsonPath("$.role").value("ROLE_USER"))
				.andExpect(jsonPath("$.firstName").value("Rahul"));
	}

	@Test
	void wrongPasswordIsRejected() throws Exception {
		mockMvc.perform(post("/api/login").contentType(MediaType.APPLICATION_JSON)
				.content(json(Map.of("username", "admin@test.com", "password", "nope"))))
				.andExpect(status().isUnauthorized())
				.andExpect(content().string("Invalid email or password"));
	}

	@Test
	void adminAddsDoctorWhoSetsOwnPasswordFromInvite() throws Exception {
		String admin = login("admin@test.com");

		mockMvc.perform(post("/api/admin/doctors").header("Authorization", "Bearer " + admin)
				.contentType(MediaType.APPLICATION_JSON).content(json(Map.of(
						"email", "dr.sharma@test.com", "firstName", "Ananya", "lastName", "Sharma",
						"specialization", "Cardiology"))))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.role").value("ROLE_DOCTOR"))
				.andExpect(jsonPath("$.enabled").value(false))
				.andExpect(jsonPath("$.password").doesNotExist());

		User doctor = userRepository.findByEmail("dr.sharma@test.com").orElseThrow();
		assertThat(doctor.getPassword()).isNull();

		mockMvc.perform(post("/api/confirmPassword").contentType(MediaType.APPLICATION_JSON)
				.content(json(Map.of("token", doctor.getConfirmationToken(), "password", PASSWORD))))
				.andExpect(status().isOk());

		String doctorToken = login("dr.sharma@test.com");
		mockMvc.perform(get("/api/doctor/profile").header("Authorization", "Bearer " + doctorToken))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.specialization").value("Cardiology"))
				.andExpect(jsonPath("$.password").doesNotExist());

		// Adding the same e-mail again is refused
		mockMvc.perform(post("/api/admin/doctors").header("Authorization", "Bearer " + admin)
				.contentType(MediaType.APPLICATION_JSON).content(json(Map.of(
						"email", "dr.sharma@test.com", "firstName", "A", "lastName", "B"))))
				.andExpect(status().isConflict());
	}

	@Test
	void patientBooksDoctorConfirmsAndSlotIsNoLongerFree() throws Exception {
		User doctor = createUser("doc@test.com", "Sarah", "Thomas", "ROLE_DOCTOR", "General Medicine");
		createUser("pat@test.com", "Rahul", "Das", "ROLE_USER", null);
		String patient = login("pat@test.com");

		// Public directory hides contact details
		mockMvc.perform(get("/api/doctors"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(1)))
				.andExpect(jsonPath("$[0].specialization").value("General Medicine"))
				.andExpect(jsonPath("$[0].email").doesNotExist());

		mockMvc.perform(get("/api/doctors/" + doctor.getId() + "/slots").param("date", tomorrow))
				.andExpect(jsonPath("$.slots", hasItem("10:00")));

		String body = mockMvc.perform(post("/api/user/appointments").header("Authorization", "Bearer " + patient)
				.contentType(MediaType.APPLICATION_JSON).content(json(Map.of(
						"doctorId", doctor.getId(), "date", tomorrow, "time", "10:00", "description", "Fever"))))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.status").value("PENDING"))
				.andExpect(jsonPath("$.doctorName").value("Dr. Sarah Thomas"))
				.andExpect(jsonPath("$.name").value("Rahul Das"))
				.andReturn().getResponse().getContentAsString();
		long appointmentId = objectMapper.readTree(body).get("id").asLong();

		// A second booking for the same slot is refused, and the slot is no longer offered
		mockMvc.perform(post("/api/user/appointments").header("Authorization", "Bearer " + patient)
				.contentType(MediaType.APPLICATION_JSON).content(json(Map.of(
						"doctorId", doctor.getId(), "date", tomorrow, "time", "10:00"))))
				.andExpect(status().isConflict());
		mockMvc.perform(get("/api/doctors/" + doctor.getId() + "/slots").param("date", tomorrow))
				.andExpect(jsonPath("$.slots", not(hasItem("10:00"))));

		// The same patient can book a second appointment (name is no longer unique)
		mockMvc.perform(post("/api/user/appointments").header("Authorization", "Bearer " + patient)
				.contentType(MediaType.APPLICATION_JSON).content(json(Map.of(
						"doctorId", doctor.getId(), "date", tomorrow, "time", "11:00"))))
				.andExpect(status().isCreated());
		mockMvc.perform(get("/api/user/appointments").header("Authorization", "Bearer " + patient))
				.andExpect(jsonPath("$", hasSize(2)));

		// The doctor sees both and confirms one, then completes it
		String doctorToken = login("doc@test.com");
		mockMvc.perform(get("/api/doctor/appointments").header("Authorization", "Bearer " + doctorToken))
				.andExpect(jsonPath("$", hasSize(2)));
		mockMvc.perform(patch("/api/doctor/appointments/" + appointmentId + "/status")
				.header("Authorization", "Bearer " + doctorToken)
				.contentType(MediaType.APPLICATION_JSON).content(json(Map.of("status", "COMPLETED"))))
				.andExpect(status().isBadRequest());
		mockMvc.perform(patch("/api/doctor/appointments/" + appointmentId + "/status")
				.header("Authorization", "Bearer " + doctorToken)
				.contentType(MediaType.APPLICATION_JSON).content(json(Map.of("status", "CONFIRMED"))))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.status").value("CONFIRMED"));
		mockMvc.perform(patch("/api/doctor/appointments/" + appointmentId + "/status")
				.header("Authorization", "Bearer " + doctorToken)
				.contentType(MediaType.APPLICATION_JSON).content(json(Map.of("status", "COMPLETED"))))
				.andExpect(jsonPath("$.status").value("COMPLETED"));

		// Admin stats reflect it
		mockMvc.perform(get("/api/admin/stats").header("Authorization", "Bearer " + login("admin@test.com")))
				.andExpect(jsonPath("$.appointments").value(2))
				.andExpect(jsonPath("$.completed").value(1))
				.andExpect(jsonPath("$.doctors").value(1));
	}

	@Test
	void patientCanCancelOnlyOwnAppointment() throws Exception {
		User doctor = createUser("doc@test.com", "Sarah", "Thomas", "ROLE_DOCTOR", "General Medicine");
		createUser("pat@test.com", "Rahul", "Das", "ROLE_USER", null);
		createUser("other@test.com", "Other", "Person", "ROLE_USER", null);

		String body = mockMvc.perform(post("/api/user/appointments")
				.header("Authorization", "Bearer " + login("pat@test.com"))
				.contentType(MediaType.APPLICATION_JSON).content(json(Map.of(
						"doctorId", doctor.getId(), "date", tomorrow, "time", "14:00"))))
				.andReturn().getResponse().getContentAsString();
		JsonNode appointment = objectMapper.readTree(body);

		mockMvc.perform(patch("/api/user/appointments/" + appointment.get("id").asLong() + "/cancel")
				.header("Authorization", "Bearer " + login("other@test.com")))
				.andExpect(status().isNotFound());
		mockMvc.perform(patch("/api/user/appointments/" + appointment.get("id").asLong() + "/cancel")
				.header("Authorization", "Bearer " + login("pat@test.com")))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.status").value("CANCELLED"));
	}

	@Test
	void bookingValidatesDateAndSlot() throws Exception {
		User doctor = createUser("doc@test.com", "Sarah", "Thomas", "ROLE_DOCTOR", "General Medicine");
		createUser("pat@test.com", "Rahul", "Das", "ROLE_USER", null);
		String patient = login("pat@test.com");

		mockMvc.perform(post("/api/user/appointments").header("Authorization", "Bearer " + patient)
				.contentType(MediaType.APPLICATION_JSON).content(json(Map.of(
						"doctorId", doctor.getId(), "date", LocalDate.now().minusDays(1).toString(), "time", "10:00"))))
				.andExpect(status().isBadRequest());
		mockMvc.perform(post("/api/user/appointments").header("Authorization", "Bearer " + patient)
				.contentType(MediaType.APPLICATION_JSON).content(json(Map.of(
						"doctorId", doctor.getId(), "date", tomorrow, "time", "13:00"))))
				.andExpect(status().isBadRequest())
				.andExpect(content().string(containsString("available time slots")));
		mockMvc.perform(post("/api/user/appointments").header("Authorization", "Bearer " + patient)
				.contentType(MediaType.APPLICATION_JSON).content(json(Map.of(
						"doctorId", 99999, "date", tomorrow, "time", "10:00"))))
				.andExpect(status().isNotFound());
	}

	@Test
	void rolesAreEnforced() throws Exception {
		createUser("pat@test.com", "Rahul", "Das", "ROLE_USER", null);
		String patient = login("pat@test.com");

		mockMvc.perform(get("/api/admin/users")).andExpect(status().isUnauthorized());
		mockMvc.perform(get("/api/admin/users").header("Authorization", "Bearer " + patient))
				.andExpect(status().isForbidden());
		mockMvc.perform(get("/api/doctor/appointments").header("Authorization", "Bearer " + patient))
				.andExpect(status().isForbidden());
		mockMvc.perform(get("/api/user/appointments").header("Authorization", "Bearer not-a-real-token"))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void forgotAndResetPassword() throws Exception {
		createUser("pat@test.com", "Rahul", "Das", "ROLE_USER", null);

		mockMvc.perform(post("/api/forgotPassword").contentType(MediaType.TEXT_PLAIN).content("pat@test.com"))
				.andExpect(status().isOk())
				.andExpect(content().string(not(containsString("-")))); // never echoes the token
		mockMvc.perform(post("/api/forgotPassword").contentType(MediaType.TEXT_PLAIN).content("nobody@test.com"))
				.andExpect(status().isOk()); // same answer for unknown addresses

		String token = userRepository.findByEmail("pat@test.com").orElseThrow().getConfirmationToken();
		String newPassword = "Another-Strong-Passphrase-7";
		mockMvc.perform(post("/api/resetPassword").contentType(MediaType.APPLICATION_JSON)
				.content(json(Map.of("token", token, "password", newPassword))))
				.andExpect(status().isOk());
		mockMvc.perform(post("/api/resetPassword").contentType(MediaType.APPLICATION_JSON)
				.content(json(Map.of("token", token, "password", newPassword))))
				.andExpect(status().isBadRequest()); // links are single-use

		mockMvc.perform(post("/api/login").contentType(MediaType.APPLICATION_JSON)
				.content(json(Map.of("username", "pat@test.com", "password", newPassword))))
				.andExpect(status().isOk());
	}

	@Test
	void profileCanBeUpdatedByAnyRole() throws Exception {
		String admin = login("admin@test.com");
		mockMvc.perform(put("/api/profile").header("Authorization", "Bearer " + admin)
				.contentType(MediaType.APPLICATION_JSON).content(json(Map.of(
						"firstName", "Asha", "lastName", "Rao", "phoneNumber", "9123456780"))))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.lastName").value("Rao"))
				.andExpect(jsonPath("$.phoneNumber").value("9123456780"));
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
				.content(json(Map.of("username", email, "password", PASSWORD))))
				.andExpect(status().isOk())
				.andReturn().getResponse().getContentAsString();
		return objectMapper.readTree(body).get("jwt").asText();
	}

	private String json(Object value) throws Exception {
		return objectMapper.writeValueAsString(value);
	}
}
