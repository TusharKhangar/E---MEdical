package com.spring.bioMedical.Controller;

import java.time.LocalDateTime;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.spring.bioMedical.dto.LoginRequest;
import com.spring.bioMedical.dto.LoginResponse;
import com.spring.bioMedical.entity.User;
import com.spring.bioMedical.security.JwtUtil;
import com.spring.bioMedical.service.AdminServiceImplementation;
import com.spring.bioMedical.service.DemoMode;
import com.spring.bioMedical.service.LoginAttemptService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api")
@Tag(name = "Authentication")
public class LoginController {

	private final AuthenticationManager authenticationManager;
	private final JwtUtil jwtUtil;
	private final AdminServiceImplementation adminServiceImplementation;
	private final LoginAttemptService loginAttempts;
	private final DemoMode demoMode;

	public LoginController(AuthenticationManager authenticationManager, JwtUtil jwtUtil,
			AdminServiceImplementation adminServiceImplementation, LoginAttemptService loginAttempts,
			DemoMode demoMode) {
		this.authenticationManager = authenticationManager;
		this.jwtUtil = jwtUtil;
		this.adminServiceImplementation = adminServiceImplementation;
		this.loginAttempts = loginAttempts;
		this.demoMode = demoMode;
	}

	@PostMapping("/login")
	@Operation(summary = "Sign in with e-mail and password",
			description = "Returns a JWT plus the user's id, name and role. Five wrong passwords lock the e-mail for 15 minutes (429).")
	public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
		if (loginRequest.getUsername() == null || loginRequest.getPassword() == null) {
			return ResponseEntity.badRequest().body("Please enter your email and password.");
		}
		String email = loginRequest.getUsername().trim().toLowerCase();

		// The shared demo accounts have a published password, so locking them only lets one visitor
		// shut everyone else out of the demo
		boolean lockable = !demoMode.isProtectedAccount(email);

		long locked = lockable ? loginAttempts.minutesLocked(email) : 0;
		if (locked > 0) {
			return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
					.body("Too many failed sign-in attempts. Please try again in " + locked + " minute"
							+ (locked == 1 ? "" : "s") + ", or reset your password.");
		}

		try {
			Authentication authentication = authenticationManager.authenticate(
					new UsernamePasswordAuthenticationToken(email, loginRequest.getPassword())
			);
			SecurityContextHolder.getContext().setAuthentication(authentication);
			loginAttempts.recordSuccess(email);
			String jwt = jwtUtil.generateToken(authentication.getName());

			User user = adminServiceImplementation.findByEmail(authentication.getName());
			user.setLastseen(LocalDateTime.now().withNano(0).toString());
			adminServiceImplementation.save(user);
			return ResponseEntity.ok(new LoginResponse(jwt, user));
		} catch (DisabledException e) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
					.body("Please confirm your e-mail and set a password using the link we sent you.");
		} catch (AuthenticationException e) {
			if (lockable) {
				loginAttempts.recordFailure(email);
			}
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password");
		}
	}
}
