package com.spring.bioMedical.Controller;

import java.util.Optional;
import java.util.UUID;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import com.nulabinc.zxcvbn.Strength;
import com.nulabinc.zxcvbn.Zxcvbn;
import com.spring.bioMedical.dto.ConfirmationRequest;
import com.spring.bioMedical.dto.ConfirmationResponse;
import com.spring.bioMedical.dto.RegistrationRequest;
import com.spring.bioMedical.entity.User;
import com.spring.bioMedical.service.EmailService;
import com.spring.bioMedical.service.UserService;

@RestController
@RequestMapping("/api")
public class RegisterController {

	private final UserService userService;
	private final EmailService emailService;
	private final PasswordEncoder passwordEncoder;

	@Autowired
	public RegisterController(UserService userService, EmailService emailService, PasswordEncoder passwordEncoder) {
		this.userService = userService;
		this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
    }

	@PostMapping("/register")
	public ResponseEntity<String> registerUser(@Valid @RequestBody RegistrationRequest registrationRequest,
											   BindingResult bindingResult,
											   HttpServletRequest request) {

		// Lookup user in database by e-mail
		Optional<User> userExists = userService.findByEmail(registrationRequest.getEmail());

		if (userExists.isPresent()) {
			return ResponseEntity.status(HttpStatus.CONFLICT).body("Oops!  There is already a user registered with the email provided.");
		}

		if (bindingResult.hasErrors()) {
			return ResponseEntity.badRequest().body("Invalid registration data");
		} else {
			// new user so we create user and send confirmation e-mail

			// Disable user until they click on confirmation link in email
			User user = registrationRequest.toEntity(); // Convert RegistrationRequest to User
			user.setEnabled(false);
			user.setRole("ROLE_USER");

			// Generate random 36-character string token for confirmation link
			user.setConfirmationToken(UUID.randomUUID().toString());

			userService.saveUser(user);


			final SimpleMailMessage registrationEmail = getSimpleMailMessage(request, user);

			emailService.sendEmail(registrationEmail);

			return ResponseEntity.ok("A confirmation e-mail has been sent to " + user.getEmail());
		}
	}

	private static SimpleMailMessage getSimpleMailMessage(HttpServletRequest request, User user) {
		String appUrl = request.getScheme() + "://" + request.getServerName() + ":" + request.getServerPort() + "/api";

		SimpleMailMessage registrationEmail = new SimpleMailMessage();
		registrationEmail.setTo(user.getEmail());
		registrationEmail.setSubject("Registration Confirmation");
		registrationEmail.setText("To confirm your e-mail address, please click the link below:\n"
				+ appUrl + "/confirm?token=" + user.getConfirmationToken());
		registrationEmail.setFrom("spring.email.auth@gmail.com");
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

	@PostMapping("/confirm")
	public ResponseEntity<String> confirmRegistration(@RequestBody ConfirmationRequest confirmationRequest,
													  BindingResult bindingResult) {

		Zxcvbn passwordCheck = new Zxcvbn();

		Strength strength = passwordCheck.measure(confirmationRequest.getPassword());

		if (strength.getScore() < 3) {
			return ResponseEntity.badRequest().body("Your password is too weak.  Choose a stronger one.");
		}

		// Find the user associated with the reset token
		Optional<User> user = userService.findByConfirmationToken(confirmationRequest.getToken());

		// Check if user is present before proceeding
		if (user.isPresent()) {
			// Set new password
			user.get().setPassword(passwordEncoder.encode(confirmationRequest.getPassword()));

			// Set user to enabled
			user.get().setEnabled(true);

			// Save user
			userService.saveUser(user.get());

			return ResponseEntity.ok("Your password has been set!");
		} else {
			// Handle the case where the user is not found (e.g., invalid token)
			return ResponseEntity.badRequest().body("Invalid confirmation token.");
		}
	}
}