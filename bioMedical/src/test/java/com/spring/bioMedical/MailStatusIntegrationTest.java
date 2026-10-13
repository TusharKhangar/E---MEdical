package com.spring.bioMedical;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
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
import com.spring.bioMedical.entity.User;
import com.spring.bioMedical.repository.UserRepository;

/** The admin's e-mail status card and "send me a test e-mail" button. Tests run with no mail provider. */
@SpringBootTest
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class MailStatusIntegrationTest {

	private static final String PASSWORD = "Correct-Horse-Battery-42";

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

	@Autowired
	private UserRepository users;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@BeforeEach
	void setUp() {
		users.deleteAll();
		create("admin@test.com", "ROLE_ADMIN");
		create("pat@test.com", "ROLE_USER");
	}

	@Test
	void adminSeesThatMailIsNotConfigured() throws Exception {
		mockMvc.perform(get("/api/admin/mail").header("Authorization", "Bearer " + login("admin@test.com")))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.mode").value("log-only"))
				.andExpect(jsonPath("$.configured").value(false))
				.andExpect(jsonPath("$.description").value(containsString("Not configured")));
	}

	@Test
	void testMailReportsWhyItCouldNotBeSent() throws Exception {
		mockMvc.perform(post("/api/admin/mail/test").header("Authorization", "Bearer " + login("admin@test.com")))
				.andExpect(status().isBadGateway())
				.andExpect(content().string(containsString("BREVO_API_KEY")));
	}

	@Test
	void onlyAdminsCanUseIt() throws Exception {
		String patient = login("pat@test.com");
		mockMvc.perform(get("/api/admin/mail").header("Authorization", "Bearer " + patient)).andExpect(status().isForbidden());
		mockMvc.perform(post("/api/admin/mail/test").header("Authorization", "Bearer " + patient)).andExpect(status().isForbidden());
		mockMvc.perform(post("/api/admin/mail/test")).andExpect(status().isUnauthorized());
	}

	private void create(String email, String role) {
		User u = new User();
		u.setEmail(email);
		u.setFirstName("Test");
		u.setLastName("User");
		u.setRole(role);
		u.setEnabled(true);
		u.setPassword(passwordEncoder.encode(PASSWORD));
		users.save(u);
	}

	private String login(String email) throws Exception {
		String body = mockMvc.perform(post("/api/login").contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(Map.of("username", email, "password", PASSWORD))))
				.andExpect(status().isOk())
				.andReturn().getResponse().getContentAsString();
		return objectMapper.readTree(body).get("jwt").asText();
	}
}
