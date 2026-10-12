package com.spring.bioMedical.Controller;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
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

@RestController
@RequestMapping("/api")
public class LoginController {

	@Autowired
	private AuthenticationManager authenticationManager;

	@Autowired
	private JwtUtil jwtUtil;

	@Autowired
	private AdminServiceImplementation adminServiceImplementation;

	@PostMapping("/login")
	public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
		if (loginRequest.getUsername() == null || loginRequest.getPassword() == null) {
			return ResponseEntity.badRequest().body("Please enter your email and password.");
		}
		String email = loginRequest.getUsername().trim().toLowerCase();
		try {
			Authentication authentication = authenticationManager.authenticate(
					new UsernamePasswordAuthenticationToken(email, loginRequest.getPassword())
			);
			SecurityContextHolder.getContext().setAuthentication(authentication);
			String jwt = jwtUtil.generateToken(authentication.getName());

			User user = adminServiceImplementation.findByEmail(authentication.getName());
			user.setLastseen(LocalDateTime.now().withNano(0).toString());
			adminServiceImplementation.save(user);
			return ResponseEntity.ok(new LoginResponse(jwt, user));
		} catch (DisabledException e) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
					.body("Please confirm your e-mail and set a password using the link we sent you.");
		} catch (AuthenticationException e) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password");
		}
	}
}
