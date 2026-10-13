package com.spring.bioMedical;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.startsWith;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

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
import com.spring.bioMedical.repository.UserRepository;

/** Demo mode (public showcase deploys without a mail account). */
@SpringBootTest(properties = { "app.demo-mode=true" })
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class DemoModeIntegrationTest {

	private static final String PASSWORD = "Demo-Account-Passphrase-99";

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

	@BeforeEach
	void setUp() {
		appointmentRepository.deleteAll();
		userRepository.deleteAll();
		createUser("admin@emedical.demo", "ROLE_ADMIN");
		createUser("patient@emedical.demo", "ROLE_USER");
	}

	@Test
	void signUpReturnsTheConfirmationLinkSoVisitorsCanFinish() throws Exception {
		String body = mockMvc.perform(post("/api/register").contentType(MediaType.APPLICATION_JSON).content(json(Map.of(
				"email", "visitor@example.com", "firstName", "Visitor", "lastName", "One", "phoneNumber", "9876543210"))))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.link").value(startsWith("http://localhost:5173/confirm?token=")))
				.andReturn().getResponse().getContentAsString();

		String token = objectMapper.readTree(body).get("link").asText().replaceAll(".*token=", "");
		mockMvc.perform(post("/api/confirmPassword").contentType(MediaType.APPLICATION_JSON)
				.content(json(Map.of("token", token, "password", "orange-kettle-maple-bridge-77"))))
				.andExpect(status().isOk());
	}

	@Test
	void staffInviteReturnsTheSetPasswordLink() throws Exception {
		mockMvc.perform(post("/api/admin/doctors").header("Authorization", "Bearer " + login("admin@emedical.demo"))
				.contentType(MediaType.APPLICATION_JSON)
				.content(json(Map.of("email", "newdoc@example.com", "firstName", "New", "lastName", "Doctor",
						"specialization", "ENT"))))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.inviteLink").value(startsWith("http://localhost:5173/set-password?token=")));
	}

	@Test
	void sharedDemoAccountsCannotBeLockedOut() throws Exception {
		mockMvc.perform(put("/api/profile/password").header("Authorization", "Bearer " + login("patient@emedical.demo"))
				.contentType(MediaType.APPLICATION_JSON)
				.content(json(Map.of("currentPassword", PASSWORD, "newPassword", "orange-kettle-maple-bridge-77"))))
				.andExpect(status().isBadRequest())
				.andExpect(content().string(containsString("demo accounts")));

		Long patientId = userRepository.findByEmail("patient@emedical.demo").orElseThrow().getId();
		mockMvc.perform(patch("/api/admin/users/" + patientId + "/enabled")
				.header("Authorization", "Bearer " + login("admin@emedical.demo"))
				.contentType(MediaType.APPLICATION_JSON).content(json(Map.of("enabled", false))))
				.andExpect(status().isBadRequest());

		// Forgot-password never e-mails a reset for them either; the reply is the usual one
		mockMvc.perform(post("/api/forgotPassword").contentType(MediaType.TEXT_PLAIN).content("admin@emedical.demo"))
				.andExpect(status().isOk());
		org.assertj.core.api.Assertions.assertThat(
				userRepository.findByEmail("admin@emedical.demo").orElseThrow().getConfirmationToken()).isNull();
	}

	private void createUser(String email, String role) {
		User user = new User();
		user.setEmail(email);
		user.setFirstName("Demo");
		user.setLastName("Account");
		user.setRole(role);
		user.setEnabled(true);
		user.setPassword(passwordEncoder.encode(PASSWORD));
		userRepository.save(user);
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
