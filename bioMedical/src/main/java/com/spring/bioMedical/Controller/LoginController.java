package com.spring.bioMedical.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.spring.bioMedical.dto.LoginRequest;
import com.spring.bioMedical.dto.LoginResponse;
import com.spring.bioMedical.security.JwtUtil;

@RestController
@RequestMapping("/api")
public class LoginController {

	@Autowired
	private AuthenticationManager authenticationManager;

	@Autowired
	private JwtUtil jwtUtil;


	@PostMapping("/login")
	public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest loginRequest) {
		try {
			Authentication authentication = authenticationManager.authenticate(
					new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
			);
			SecurityContextHolder.getContext().setAuthentication(authentication);
			String jwt = jwtUtil.generateToken(authentication.getName());
			return ResponseEntity.ok(new LoginResponse(jwt));
		} catch (BadCredentialsException e) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
		}
	}
}