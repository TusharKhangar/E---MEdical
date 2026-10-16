package com.spring.bioMedical;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.matchesPattern;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.actuate.observability.AutoConfigureObservability;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.spring.bioMedical.entity.User;
import com.spring.bioMedical.repository.UserRepository;

/** /actuator/prometheus is only for the scraper's token or an admin, and shows the app's own metrics. */
// Tests use their own application.properties, so the production metrics settings are repeated here
@SpringBootTest(properties = { "app.metrics-token=test-scrape-token",
		"management.endpoints.web.exposure.include=health,info,prometheus",
		"management.metrics.distribution.percentiles-histogram.http.server.requests=true" })
@AutoConfigureMockMvc
@AutoConfigureObservability
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class ObservabilityIntegrationTest {

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
	void metricsNeedTheScrapeTokenOrAnAdmin() throws Exception {
		mockMvc.perform(get("/actuator/prometheus")).andExpect(status().isUnauthorized());
		mockMvc.perform(get("/actuator/prometheus").header("Authorization", "Bearer wrong-token"))
				.andExpect(status().isUnauthorized());
		mockMvc.perform(get("/actuator/prometheus").header("Authorization", "Bearer " + login("pat@test.com")))
				.andExpect(status().isForbidden());

		mockMvc.perform(get("/actuator/prometheus").header("Authorization", "Bearer test-scrape-token"))
				.andExpect(status().isOk());
		mockMvc.perform(get("/actuator/prometheus").header("Authorization", "Bearer " + login("admin@test.com")))
				.andExpect(status().isOk());
	}

	@Test
	void showsLoginsPendingAppointmentsAndLatencyHistograms() throws Exception {
		mockMvc.perform(post("/api/login").contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(Map.of("username", "pat@test.com", "password", "wrong"))))
				.andExpect(status().isUnauthorized());
		login("pat@test.com");

		mockMvc.perform(get("/actuator/prometheus").header("Authorization", "Bearer test-scrape-token"))
				.andExpect(status().isOk())
				.andExpect(content().string(containsString("emedical_logins_total{application=\"e-medical\",result=\"wrong_password\",}")))
				.andExpect(content().string(containsString("emedical_logins_total{application=\"e-medical\",result=\"success\",}")))
				.andExpect(content().string(containsString("emedical_appointments_pending{application=\"e-medical\",} 0.0")))
				.andExpect(content().string(containsString("http_server_requests_seconds_bucket")));
	}

	@Test
	void everyResponseCarriesARequestId() throws Exception {
		mockMvc.perform(get("/api/doctors").header("X-Request-Id", "abc-123"))
				.andExpect(header().string("X-Request-Id", "abc-123"));
		// Anything unsafe for a log line is replaced with a fresh id
		mockMvc.perform(get("/api/doctors").header("X-Request-Id", "bad id\nwith newline"))
				.andExpect(header().string("X-Request-Id", matchesPattern("[0-9a-f-]{36}")));
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
