package com.spring.bioMedical.Controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.spring.bioMedical.dto.UserProfileResponse;
import com.spring.bioMedical.entity.User;
import com.spring.bioMedical.exception.ApiException;
import com.spring.bioMedical.service.AdminServiceImplementation;
import com.spring.bioMedical.service.PasswordStrength;

import java.util.Map;

/** The signed-in user's own profile, for every role. */
@RestController
@RequestMapping("/api/profile")
public class ProfileController {

	private final AdminServiceImplementation adminServiceImplementation;
	private final PasswordEncoder passwordEncoder;

	public ProfileController(AdminServiceImplementation adminServiceImplementation, PasswordEncoder passwordEncoder) {
		this.adminServiceImplementation = adminServiceImplementation;
		this.passwordEncoder = passwordEncoder;
	}

	@GetMapping
	public ResponseEntity<UserProfileResponse> getProfile() {
		return ResponseEntity.ok(new UserProfileResponse(me()));
	}

	/** Body: any of firstName, lastName, phoneNumber, gender, and specialization for doctors. */
	@PutMapping
	public ResponseEntity<UserProfileResponse> updateProfile(@RequestBody Map<String, String> body) {
		User user = me();
		String firstName = body.get("firstName");
		String lastName = body.get("lastName");
		if (firstName != null && !firstName.isBlank()) {
			user.setFirstName(firstName.trim());
		}
		if (lastName != null && !lastName.isBlank()) {
			user.setLastName(lastName.trim());
		}
		if (body.containsKey("phoneNumber")) {
			String phone = body.get("phoneNumber");
			if (phone != null && !phone.isBlank() && !phone.matches("^[1-9][0-9]{9}$")) {
				throw new ApiException(HttpStatus.BAD_REQUEST, "Please provide a 10-digit phone number");
			}
			user.setPhoneNumber(phone == null || phone.isBlank() ? null : phone);
		}
		if (body.containsKey("gender")) {
			user.setGender(body.get("gender"));
		}
		if ("ROLE_DOCTOR".equals(user.getRole()) && body.containsKey("specialization")) {
			user.setSpecialization(body.get("specialization"));
		}
		adminServiceImplementation.save(user);
		return ResponseEntity.ok(new UserProfileResponse(user));
	}

	/** Body: {"currentPassword": "...", "newPassword": "..."}. */
	@PutMapping("/password")
	public ResponseEntity<String> changePassword(@RequestBody Map<String, String> body) {
		User user = me();
		String current = body.get("currentPassword");
		String next = body.get("newPassword");
		if (current == null || user.getPassword() == null || !passwordEncoder.matches(current, user.getPassword())) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "Your current password is not correct.");
		}
		if (PasswordStrength.isTooWeak(next)) {
			throw new ApiException(HttpStatus.BAD_REQUEST, PasswordStrength.TOO_WEAK_MESSAGE);
		}
		user.setPassword(passwordEncoder.encode(next));
		adminServiceImplementation.save(user);
		return ResponseEntity.ok("Your password has been changed.");
	}

	private User me() {
		return adminServiceImplementation.findByEmail(SecurityContextHolder.getContext().getAuthentication().getName());
	}
}
