package com.spring.bioMedical.Controller;

import java.util.Optional;
import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import com.spring.bioMedical.dto.ConfirmationRequest;
import com.spring.bioMedical.dto.ConfirmationResponse;
import com.spring.bioMedical.dto.LinkResponse;
import com.spring.bioMedical.dto.RegistrationRequest;
import com.spring.bioMedical.entity.User;
import com.spring.bioMedical.service.EmailService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import com.spring.bioMedical.service.PasswordStrength;
import com.spring.bioMedical.service.UserService;

/**
 * Patient sign-up. The account is created disabled; the e-mailed link opens the React app, where the
 * patient confirms their address and chooses a password, which enables the account.
 */
@RestController
@RequestMapping("/api")
@Tag(name = "Authentication")
public class RegisterController {

	// The public doctor list is cached (see CacheConfig); optional so web-layer tests don't need it
	@org.springframework.beans.factory.annotation.Autowired
	private org.springframework.beans.factory.ObjectProvider<com.spring.bioMedical.config.CacheConfig.Evictions> cacheEvictions;

	private final UserService userService;
	private final EmailService emailService;
	private final PasswordEncoder passwordEncoder;

	@Value("${app.frontend-url:http://localhost:5173}")
	private String frontendUrl;

	@Autowired
	public RegisterController(UserService userService, EmailService emailService, PasswordEncoder passwordEncoder) {
		this.userService = userService;
		this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
    }

	@PostMapping("/register")
	@Operation(summary = "Register as a patient",
			description = "Creates a disabled account and e-mails a confirmation link.")
	public ResponseEntity<?> registerUser(@Valid @RequestBody RegistrationRequest registrationRequest,
											   BindingResult bindingResult) {

		if (bindingResult.hasErrors()) {
			return ResponseEntity.badRequest().body(bindingResult.getFieldErrors().get(0).getDefaultMessage());
		}

		// Lookup user in database by e-mail
		Optional<User> userExists = userService.findByEmail(registrationRequest.getEmail().trim().toLowerCase());

		if (userExists.isPresent()) {
			return ResponseEntity.status(HttpStatus.CONFLICT).body("Oops!  There is already a user registered with the email provided.");
		}

		// new user so we create user and send confirmation e-mail

		// Disable user until they click on confirmation link in email
		User user = registrationRequest.toEntity(); // Convert RegistrationRequest to User
		user.setEnabled(false);
		user.setRole("ROLE_USER");

		// Generate random 36-character string token for confirmation link
		user.setConfirmationToken(UUID.randomUUID().toString());

		userService.saveUser(user);

		String link = frontendUrl + "/confirm?token=" + user.getConfirmationToken();
		emailService.sendEmail(getSimpleMailMessage(user, link));

		return ResponseEntity.ok(new LinkResponse("A confirmation e-mail has been sent to " + user.getEmail()));
	}

	private static SimpleMailMessage getSimpleMailMessage(User user, String link) {
		SimpleMailMessage registrationEmail = new SimpleMailMessage();
		registrationEmail.setTo(user.getEmail());
		registrationEmail.setSubject("Registration Confirmation");
		registrationEmail.setText("To confirm your e-mail address, please click the link below:\n" + link);
		return registrationEmail;
	}

	@GetMapping("/confirm")
	public ResponseEntity<ConfirmationResponse> confirmRegistration(@RequestParam("token") String token) {
		Optional<User> user = userService.findByConfirmationToken(token);

		if (user.isEmpty()) { // No token found in DB
			return ResponseEntity.badRequest().body(new ConfirmationResponse(null, "Oops!  This is an invalid confirmation link."));
		} else { // Token found
			return ResponseEntity.ok(new ConfirmationResponse(token, "Your token has been generated"));
		}
	}

	@PostMapping("/confirmPassword")
	public ResponseEntity<String> confirmRegistration(@Valid @RequestBody ConfirmationRequest confirmationRequest,
													  BindingResult bindingResult) {

		if (bindingResult.hasErrors()) {
			return ResponseEntity.badRequest().body(bindingResult.getFieldErrors().get(0).getDefaultMessage());
		}

		if (PasswordStrength.isTooWeak(confirmationRequest.getPassword())) {
			return ResponseEntity.badRequest().body(PasswordStrength.TOO_WEAK_MESSAGE);
		}

		// Find the user associated with the reset token
		Optional<User> user = userService.findByConfirmationToken(confirmationRequest.getToken());

		// Check if user is present before proceeding
		if (user.isPresent()) {
			// Set new password
			user.get().setPassword(passwordEncoder.encode(confirmationRequest.getPassword()));

			// Set user to enabled
			user.get().setEnabled(true);

			// The link is single-use
			user.get().setConfirmationToken(null);

			// Save user
			userService.saveUser(user.get());
			// An invited doctor shows up in the (cached) public directory now, not a minute later
			cacheEvictions.ifAvailable(e -> e.ifDoctor(user.get()));

			return ResponseEntity.ok("Your password has been set!");
		} else {
			// Handle the case where the user is not found (e.g., invalid token)
			return ResponseEntity.badRequest().body("Invalid confirmation token.");
		}
	}
}
