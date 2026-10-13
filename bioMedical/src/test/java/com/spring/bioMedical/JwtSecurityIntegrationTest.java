package com.spring.bioMedical;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.spring.bioMedical.entity.User;
import com.spring.bioMedical.repository.UserRepository;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

/** The JWT checks: signature, expiry, unknown users and accounts disabled after the token was issued. */
@SpringBootTest
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class JwtSecurityIntegrationTest {

	private static final String PASSWORD = "Correct-Horse-Battery-42";

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

	@Autowired
	private UserRepository users;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@Value("${jwt.secret}")
	private String secret;

	@BeforeEach
	void setUp() {
		users.deleteAll();
		User u = new User();
		u.setEmail("pat@test.com");
		u.setFirstName("Pat");
		u.setLastName("Test");
		u.setRole("ROLE_USER");
		u.setEnabled(true);
		u.setPassword(passwordEncoder.encode(PASSWORD));
		users.save(u);
	}

	@Test
	void aTokenFromLoginWorks() throws Exception {
		mockMvc.perform(get("/api/profile").header("Authorization", "Bearer " + login())).andExpect(status().isOk());
	}

	@Test
	void anExpiredTokenIsRejected() throws Exception {
		String expired = Jwts.builder().subject("pat@test.com")
				.issuedAt(new Date(System.currentTimeMillis() - 7_200_000))
				.expiration(new Date(System.currentTimeMillis() - 3_600_000))
				.signWith(Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8)))
				.compact();
		mockMvc.perform(get("/api/profile").header("Authorization", "Bearer " + expired)).andExpect(status().isUnauthorized());
	}

	@Test
	void aTokenSignedWithAnotherKeyIsRejected() throws Exception {
		String foreign = Jwts.builder().subject("pat@test.com")
				.expiration(new Date(System.currentTimeMillis() + 3_600_000))
				.signWith(Keys.hmacShaKeyFor("someone-else-s-key-that-is-long-enough-123456".getBytes(StandardCharsets.UTF_8)))
				.compact();
		mockMvc.perform(get("/api/profile").header("Authorization", "Bearer " + foreign)).andExpect(status().isUnauthorized());
	}

	@Test
	void aTokenForAnAccountThatNoLongerExistsIsRejected() throws Exception {
		String jwt = login();
		users.deleteAll();
		mockMvc.perform(get("/api/profile").header("Authorization", "Bearer " + jwt)).andExpect(status().isUnauthorized());
	}

	@Test
	void disablingAnAccountShutsOutTokensIssuedBefore() throws Exception {
		String jwt = login();
		User u = users.findByEmail("pat@test.com").orElseThrow();
		u.setEnabled(false);
		users.save(u);
		mockMvc.perform(get("/api/profile").header("Authorization", "Bearer " + jwt)).andExpect(status().isUnauthorized());
	}

	@Test
	void aMissingBearerPrefixIsTreatedAsNoToken() throws Exception {
		mockMvc.perform(get("/api/profile").header("Authorization", login())).andExpect(status().isUnauthorized());
	}

	private String login() throws Exception {
		String body = mockMvc.perform(post("/api/login").contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(Map.of("username", "pat@test.com", "password", PASSWORD))))
				.andExpect(status().isOk())
				.andReturn().getResponse().getContentAsString();
		return objectMapper.readTree(body).get("jwt").asText();
	}
}
