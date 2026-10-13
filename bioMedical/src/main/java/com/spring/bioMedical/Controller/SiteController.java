package com.spring.bioMedical.Controller;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Objects;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.spring.bioMedical.dto.ContactRequest;
import com.spring.bioMedical.entity.Appointment;
import com.spring.bioMedical.entity.ContactMessage;
import com.spring.bioMedical.entity.User;
import com.spring.bioMedical.exception.ApiException;
import com.spring.bioMedical.repository.ContactMessageRepository;
import com.spring.bioMedical.service.AdminServiceImplementation;
import com.spring.bioMedical.service.AppointmentServiceImplementation;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

/** Public endpoints behind the marketing pages: real numbers for the home page and the contact form. */
@RestController
@RequestMapping("/api")
@Tag(name = "Public site")
public class SiteController {

	/** At most this many contact messages per e-mail address per hour, to keep the inbox spam-free. */
	static final int MAX_MESSAGES_PER_HOUR = 3;

	private final AdminServiceImplementation users;
	private final AppointmentServiceImplementation appointments;
	private final ContactMessageRepository contactMessages;

	public SiteController(AdminServiceImplementation users, AppointmentServiceImplementation appointments,
			ContactMessageRepository contactMessages) {
		this.users = users;
		this.appointments = appointments;
		this.contactMessages = contactMessages;
	}

	@GetMapping("/stats")
	@Operation(summary = "Headline numbers for the home page")
	public ResponseEntity<Map<String, Long>> stats() {
		Map<String, Long> stats = new LinkedHashMap<>();
		stats.put("patients", users.countByRole("ROLE_USER"));
		stats.put("doctors", users.findByRole("ROLE_DOCTOR").stream().filter(User::getEnabled).count());
		stats.put("departments", users.findByRole("ROLE_DOCTOR").stream()
				.filter(User::getEnabled)
				.map(User::getSpecialization)
				.filter(Objects::nonNull)
				.distinct()
				.count());
		stats.put("completedVisits", appointments.countByStatus(Appointment.COMPLETED));
		return ResponseEntity.ok(stats);
	}

	@PostMapping("/contact")
	@Operation(summary = "Send a message from the Contact page", description = "Stored for administrators. Limited to 3 per e-mail per hour.")
	public ResponseEntity<String> contact(@Valid @RequestBody ContactRequest request) {
		String email = request.email().trim().toLowerCase();
		if (contactMessages.countByEmailIgnoreCaseAndCreatedAtAfter(email, LocalDateTime.now().minusHours(1)) >= MAX_MESSAGES_PER_HOUR) {
			throw new ApiException(HttpStatus.TOO_MANY_REQUESTS, "You've sent several messages already. Please wait a while before sending another.");
		}
		ContactMessage message = new ContactMessage();
		message.setName(request.name().trim());
		message.setEmail(email);
		message.setSubject(request.subject() == null || request.subject().isBlank() ? null : request.subject().trim());
		message.setMessage(request.message().trim());
		contactMessages.save(message);
		return ResponseEntity.status(HttpStatus.CREATED).body("Thanks, " + message.getName() + ". We'll get back to you soon.");
	}
}
