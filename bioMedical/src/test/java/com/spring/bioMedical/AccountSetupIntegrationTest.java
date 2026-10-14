package com.spring.bioMedical;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

import com.spring.bioMedical.config.AccountSetup;
import com.spring.bioMedical.entity.User;
import com.spring.bioMedical.repository.UserRepository;

/** Startup account setup: the first administrator, and retiring the old public demo accounts. */
@SpringBootTest(properties = "app.admin.email=Owner@Clinic.test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class AccountSetupIntegrationTest {

	// Test passwords are generated at runtime, so no password-looking literal sits in the source
	private static final String OWNER_PASSWORD = "owner-" + UUID.randomUUID();
	private static final String CHANGED_PASSWORD = "changed-" + UUID.randomUUID();

	@DynamicPropertySource
	static void adminPassword(DynamicPropertyRegistry registry) {
		registry.add("app.admin.password", () -> OWNER_PASSWORD);
	}

	@Autowired
	private AccountSetup accountSetup;

	@Autowired
	private UserRepository users;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@BeforeEach
	void clean() {
		users.deleteAll();
	}

	@Test
	void createsTheFirstAdminOnceAndNeverOverwritesIt() throws Exception {
		accountSetup.run(null);
		User admin = users.findByEmail("owner@clinic.test").orElseThrow();
		assertThat(admin.getRole()).isEqualTo("ROLE_ADMIN");
		assertThat(admin.getEnabled()).isTrue();
		assertThat(passwordEncoder.matches(OWNER_PASSWORD, admin.getPassword())).isTrue();

		// The owner changes their password in the app; a restart must not reset it
		admin.setPassword(passwordEncoder.encode(CHANGED_PASSWORD));
		users.save(admin);
		accountSetup.run(null);
		assertThat(passwordEncoder.matches(CHANGED_PASSWORD,
				users.findByEmail("owner@clinic.test").orElseThrow().getPassword())).isTrue();
		assertThat(users.count()).isEqualTo(1);
	}

	@Test
	void adminResetTakesOverAnExistingAccount() throws Exception {
		User patient = user("owner@clinic.test");
		patient.setEnabled(false);
		users.save(patient);

		accountSetup.run(null); // without the flag: left alone
		assertThat(users.findByEmail("owner@clinic.test").orElseThrow().getRole()).isEqualTo("ROLE_USER");

		org.springframework.test.util.ReflectionTestUtils.setField(accountSetup, "adminReset", true);
		try {
			accountSetup.run(null);
		} finally {
			org.springframework.test.util.ReflectionTestUtils.setField(accountSetup, "adminReset", false);
		}
		User admin = users.findByEmail("owner@clinic.test").orElseThrow();
		assertThat(admin.getRole()).isEqualTo("ROLE_ADMIN");
		assertThat(admin.getEnabled()).isTrue();
		assertThat(passwordEncoder.matches(OWNER_PASSWORD, admin.getPassword())).isTrue();
		assertThat(users.count()).isEqualTo(1);
	}

	@Test
	void disablesTheOldDemoAccountsOnly() throws Exception {
		users.save(user("admin@emedical.demo"));
		users.save(user("Doctor@EMedical.demo"));
		users.save(user("real.patient@gmail.com"));

		accountSetup.run(null);

		assertThat(users.findByEmail("admin@emedical.demo").orElseThrow().getEnabled()).isFalse();
		assertThat(users.findByEmail("Doctor@EMedical.demo").orElseThrow().getEnabled()).isFalse();
		assertThat(users.findByEmail("real.patient@gmail.com").orElseThrow().getEnabled()).isTrue();
	}

	private User user(String email) {
		User u = new User();
		u.setEmail(email);
		u.setFirstName("Test");
		u.setLastName("User");
		u.setRole("ROLE_USER");
		u.setEnabled(true);
		u.setPassword(passwordEncoder.encode("whatever-123"));
		return u;
	}
}
