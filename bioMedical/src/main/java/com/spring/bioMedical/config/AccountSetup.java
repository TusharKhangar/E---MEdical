package com.spring.bioMedical.config;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.spring.bioMedical.entity.User;
import com.spring.bioMedical.repository.UserRepository;
import com.spring.bioMedical.service.EmailService;
import com.spring.bioMedical.service.PasswordStrength;

/**
 * Runs once at startup.
 * <ul>
 * <li>Creates the first administrator from {@code ADMIN_EMAIL} and {@code ADMIN_PASSWORD} when no account
 * with that e-mail exists yet. An existing account is never changed, so the variables can stay set.</li>
 * <li>Switches off the old public demo accounts ({@code ...@emedical.demo}). Their password was published,
 * so they must not be usable on a real deployment. They are disabled, not deleted, so their history stays.</li>
 * </ul>
 */
@Component
public class AccountSetup implements ApplicationRunner {

	private static final Logger logger = LoggerFactory.getLogger(AccountSetup.class);
	static final String RETIRED_DOMAIN = "@emedical.demo";

	private final UserRepository users;
	private final PasswordEncoder passwordEncoder;
	private final EmailService emailService;

	@Value("${app.admin.email:}")
	private String adminEmail;

	@Value("${app.admin.password:}")
	private String adminPassword;

	public AccountSetup(UserRepository users, PasswordEncoder passwordEncoder, EmailService emailService) {
		this.users = users;
		this.passwordEncoder = passwordEncoder;
		this.emailService = emailService;
	}

	@Override
	public void run(ApplicationArguments args) {
		retireDemoAccounts();
		createFirstAdmin();
		logger.info("E-mail delivery: {}", emailService.mode());
	}

	private void retireDemoAccounts() {
		List<User> demo = users.findAll().stream()
				.filter(u -> u.getEmail() != null && u.getEmail().toLowerCase().endsWith(RETIRED_DOMAIN) && u.getEnabled())
				.toList();
		demo.forEach(u -> {
			u.setEnabled(false);
			u.setConfirmationToken(null);
		});
		users.saveAll(demo);
		if (!demo.isEmpty()) {
			logger.warn("Disabled {} old demo account(s) ({})", demo.size(), RETIRED_DOMAIN);
		}
	}

	private void createFirstAdmin() {
		if (adminEmail == null || adminEmail.isBlank()) {
			return;
		}
		String email = adminEmail.trim().toLowerCase();
		if (users.findByEmail(email).isPresent()) {
			return;
		}
		if (adminPassword == null || PasswordStrength.isTooWeak(adminPassword)) {
			logger.error("ADMIN_EMAIL is set but ADMIN_PASSWORD is missing or too weak; no administrator was created. {}",
					PasswordStrength.TOO_WEAK_MESSAGE);
			return;
		}
		User admin = new User();
		admin.setEmail(email);
		admin.setFirstName("Clinic");
		admin.setLastName("Administrator");
		admin.setRole("ROLE_ADMIN");
		admin.setEnabled(true);
		admin.setPassword(passwordEncoder.encode(adminPassword));
		users.save(admin);
		logger.info("Created the first administrator account: {}", email);
	}
}
