package com.spring.bioMedical;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasSize;
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
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.spring.bioMedical.entity.User;
import com.spring.bioMedical.repository.AppointmentRepository;
import com.spring.bioMedical.repository.ContactMessageRepository;
import com.spring.bioMedical.repository.UserRepository;
import com.spring.bioMedical.service.LoginAttemptService;

/**
 * Covers the issues found in the interview-style review of the live site: error codes, booking gaps,
 * brute-force protection, the contact form, public stats, API docs and security headers.
 */
@SpringBootTest(properties = { "app.login.max-failures=3" })
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class HardeningIntegrationTest {

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
	private ContactMessageRepository contactMessageRepository;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@Autowired
	private LoginAttemptService loginAttempts;

	@BeforeEach
	void setUp() {
		appointmentRepository.deleteAll();
		contactMessageRepository.deleteAll();
		userRepository.deleteAll();
		loginAttempts.recordSuccess("admin@test.com"); // clear any lock left by another test
		createUser("admin@test.com", "ROLE_ADMIN", null);
		createUser("pat@test.com", "ROLE_USER", null);
	}

	@Test
	void blankNamesAreA400NotA500() throws Exception {
		mockMvc.perform(post("/api/register").contentType(MediaType.APPLICATION_JSON).content(json(Map.of(
				"email", "new@test.com", "firstName", "   ", "lastName", "Das", "phoneNumber", "9876543210"))))
				.andExpect(status().isBadRequest())
				.andExpect(content().string(containsString("first name")));
	}

	@Test
	void unknownApiPathIsA404() throws Exception {
		mockMvc.perform(get("/api/does-not-exist").header("Authorization", "Bearer " + login("pat@test.com")))
				.andExpect(status().isNotFound());
	}

	@Test
	void unauthorizedAndForbiddenArePlainText() throws Exception {
		mockMvc.perform(get("/api/admin/stats"))
				.andExpect(status().isUnauthorized())
				.andExpect(content().string("Please sign in to continue."));
		mockMvc.perform(get("/api/admin/stats").header("Authorization", "Bearer " + login("pat@test.com")))
				.andExpect(status().isForbidden())
				.andExpect(content().string("You do not have permission to do that."));
	}

	@Test
	void patientCannotBeInTwoPlacesAtOnce() throws Exception {
		User first = createUser("doc1@test.com", "ROLE_DOCTOR", "Cardiology");
		User second = createUser("doc2@test.com", "ROLE_DOCTOR", "ENT");
		String patient = login("pat@test.com");
		String day = LocalDate.now().plusDays(3).toString();

		mockMvc.perform(post("/api/user/appointments").header("Authorization", "Bearer " + patient)
				.contentType(MediaType.APPLICATION_JSON)
				.content(json(Map.of("doctorId", first.getId(), "date", day, "time", "10:00"))))
				.andExpect(status().isCreated());
		mockMvc.perform(post("/api/user/appointments").header("Authorization", "Bearer " + patient)
				.contentType(MediaType.APPLICATION_JSON)
				.content(json(Map.of("doctorId", second.getId(), "date", day, "time", "10:00"))))
				.andExpect(status().isConflict())
				.andExpect(content().string(containsString("already have an appointment")));
	}

	@Test
	void repeatedWrongPasswordsLockTheAccountTemporarily() throws Exception {
		for (int i = 0; i < 3; i++) {
			mockMvc.perform(post("/api/login").contentType(MediaType.APPLICATION_JSON)
					.content(json(Map.of("username", "admin@test.com", "password", "wrong" + i))))
					.andExpect(status().isUnauthorized());
		}
		// Even the right password is refused while locked
		mockMvc.perform(post("/api/login").contentType(MediaType.APPLICATION_JSON)
				.content(json(Map.of("username", "admin@test.com", "password", PASSWORD))))
				.andExpect(status().isTooManyRequests())
				.andExpect(content().string(containsString("Too many failed sign-in attempts")));
		// Other accounts are unaffected
		login("pat@test.com");
	}

	@Test
	void contactFormIsStoredForAdminsAndRateLimited() throws Exception {
		Map<String, String> body = Map.of("name", "Meera", "email", "meera@example.com", "subject", "Billing",
				"message", "Do you accept insurance?");
		for (int i = 0; i < 3; i++) {
			mockMvc.perform(post("/api/contact").contentType(MediaType.APPLICATION_JSON).content(json(body)))
					.andExpect(status().isCreated());
		}
		mockMvc.perform(post("/api/contact").contentType(MediaType.APPLICATION_JSON).content(json(body)))
				.andExpect(status().isTooManyRequests());
		mockMvc.perform(post("/api/contact").contentType(MediaType.APPLICATION_JSON)
				.content(json(Map.of("name", "X", "email", "x@example.com", "message", " "))))
				.andExpect(status().isBadRequest());

		String admin = login("admin@test.com");
		mockMvc.perform(get("/api/admin/messages").header("Authorization", "Bearer " + admin))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(3)))
				.andExpect(jsonPath("$[0].subject").value("Billing"))
				.andExpect(jsonPath("$[0].handled").value(false));
		mockMvc.perform(get("/api/admin/messages").header("Authorization", "Bearer " + login("pat@test.com")))
				.andExpect(status().isForbidden());
	}

	@Test
	void publicStatsCountRealData() throws Exception {
		createUser("doc1@test.com", "ROLE_DOCTOR", "Cardiology");
		createUser("doc2@test.com", "ROLE_DOCTOR", "Cardiology");
		createUser("doc3@test.com", "ROLE_DOCTOR", "ENT");
		mockMvc.perform(get("/api/stats"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.doctors").value(3))
				.andExpect(jsonPath("$.departments").value(2))
				.andExpect(jsonPath("$.patients").value(1));
	}

	@Test
	void apiDocsArePublishedAndBrowserHeadersSet() throws Exception {
		mockMvc.perform(get("/v3/api-docs"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.info.title").value("E-Medical API"))
				.andExpect(jsonPath("$.paths['/api/login']").exists());
		mockMvc.perform(get("/api/doctors"))
				.andExpect(header().string("Content-Security-Policy", containsString("default-src 'self'")))
				.andExpect(header().string("Referrer-Policy", "strict-origin-when-cross-origin"));
	}

	@Test
	void signUpLinkIsNotExposedOutsideDemoMode() throws Exception {
		mockMvc.perform(post("/api/register").contentType(MediaType.APPLICATION_JSON).content(json(Map.of(
				"email", "new@test.com", "firstName", "New", "lastName", "Person", "phoneNumber", "9876543210"))))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.message").value(containsString("confirmation e-mail")))
				.andExpect(jsonPath("$.link").doesNotExist());
	}

	private User createUser(String email, String role, String specialization) {
		User user = new User();
		user.setEmail(email);
		user.setFirstName("Test");
		user.setLastName("User");
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
