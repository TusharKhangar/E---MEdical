package com.spring.bioMedical.Controller;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import com.spring.bioMedical.dto.AdminDto;
import com.spring.bioMedical.dto.AppointmentDto;
import com.spring.bioMedical.entity.User;
import com.spring.bioMedical.entity.Appointment;
import com.spring.bioMedical.exception.ApiException;
import com.spring.bioMedical.service.AdminServiceImplementation;
import com.spring.bioMedical.service.AppointmentServiceImplementation;
import com.spring.bioMedical.service.EmailService;

import jakarta.validation.Valid;

/**
 * @
 */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

	private final AdminServiceImplementation adminServiceImplementation;
	private final AppointmentServiceImplementation appointmentServiceImplementation;
	private final EmailService emailService;

	@Value("${app.frontend-url:http://localhost:5173}")
	private String frontendUrl;

	@Autowired
	public AdminController(AdminServiceImplementation obj, AppointmentServiceImplementation app, EmailService emailService) {
		this.adminServiceImplementation = obj;
		this.appointmentServiceImplementation = app;
		this.emailService = emailService;
	}

	@GetMapping("/users")
	public ResponseEntity<List<AdminDto>> getUsers() {
		updateLastSeen();
		return ResponseEntity.ok(accountsWithRole("ROLE_USER"));
	}

	@GetMapping("/doctors")
	public ResponseEntity<List<AdminDto>> getDoctors() {
		updateLastSeen();
		return ResponseEntity.ok(accountsWithRole("ROLE_DOCTOR"));
	}

	@GetMapping("/admins")
	public ResponseEntity<List<AdminDto>> getAdmins() {
		updateLastSeen();
		return ResponseEntity.ok(accountsWithRole("ROLE_ADMIN"));
	}

	@PostMapping("/doctors")
	public ResponseEntity<AdminDto> addDoctor(@Valid @RequestBody AdminDto adminDto) {
		return ResponseEntity.status(HttpStatus.CREATED).body(createStaff(adminDto, "ROLE_DOCTOR"));
	}

	@PostMapping("/admins")
	public ResponseEntity<AdminDto> addAdmin(@Valid @RequestBody AdminDto adminDto) {
		return ResponseEntity.status(HttpStatus.CREATED).body(createStaff(adminDto, "ROLE_ADMIN"));
	}

	/** Enable or disable an account. Body: {"enabled": false}. */
	@PatchMapping("/users/{id}/enabled")
	public ResponseEntity<AdminDto> setEnabled(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
		User me = adminServiceImplementation.findByEmail(getLoggedInUsername());
		if (me.getId().equals(id)) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "You cannot disable your own account.");
		}
		User user = adminServiceImplementation.findById(id)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Account not found"));
		boolean enabled = Boolean.TRUE.equals(body.get("enabled"));
		if (enabled && user.getPassword() == null) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "This person has not set a password yet.");
		}
		user.setEnabled(enabled);
		adminServiceImplementation.save(user);
		return ResponseEntity.ok(new AdminDto(user));
	}

	@GetMapping("/profile")
	public ResponseEntity<AdminDto> getMyProfile() {
		return ResponseEntity.ok(new AdminDto(updateLastSeen()));
	}

	/** Updates the signed-in admin's own name, phone and gender. */
	@PutMapping("/profile")
	public ResponseEntity<AdminDto> updateProfile(@RequestBody AdminDto adminDto) {
		User admin = adminServiceImplementation.findByEmail(getLoggedInUsername());
		if (adminDto.getFirstName() != null && !adminDto.getFirstName().isBlank()) {
			admin.setFirstName(adminDto.getFirstName().trim());
		}
		if (adminDto.getLastName() != null && !adminDto.getLastName().isBlank()) {
			admin.setLastName(adminDto.getLastName().trim());
		}
		admin.setPhoneNumber(adminDto.getPhoneNumber());
		admin.setGender(adminDto.getGender());
		adminServiceImplementation.save(admin);
		return ResponseEntity.ok(new AdminDto(admin));
	}

	@GetMapping("/appointments")
	public ResponseEntity<List<AppointmentDto>> getAppointments() {
		updateLastSeen();
		List<AppointmentDto> appointments = appointmentServiceImplementation.findAll()
				.stream()
				.map(AppointmentDto::new)
				.collect(Collectors.toList());
		return ResponseEntity.ok(appointments);
	}

	/** Confirm, complete or cancel any appointment. Body: {"status": "CONFIRMED"}. */
	@PatchMapping("/appointments/{id}/status")
	public ResponseEntity<AppointmentDto> updateAppointmentStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
		Appointment appointment = appointmentServiceImplementation.findById(id)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Appointment not found"));
		String status = String.valueOf(body.get("status")).toUpperCase();
		return ResponseEntity.ok(new AppointmentDto(appointmentServiceImplementation.changeStatus(appointment, status)));
	}

	/** Counts for the admin dashboard cards. */
	@GetMapping("/stats")
	public ResponseEntity<Map<String, Long>> getStats() {
		Map<String, Long> stats = new LinkedHashMap<>();
		stats.put("patients", adminServiceImplementation.countByRole("ROLE_USER"));
		stats.put("doctors", adminServiceImplementation.countByRole("ROLE_DOCTOR"));
		stats.put("admins", adminServiceImplementation.countByRole("ROLE_ADMIN"));
		stats.put("appointments", appointmentServiceImplementation.count());
		stats.put("pending", appointmentServiceImplementation.countByStatus(Appointment.PENDING));
		stats.put("confirmed", appointmentServiceImplementation.countByStatus(Appointment.CONFIRMED));
		stats.put("completed", appointmentServiceImplementation.countByStatus(Appointment.COMPLETED));
		stats.put("cancelled", appointmentServiceImplementation.countByStatus(Appointment.CANCELLED));
		return ResponseEntity.ok(stats);
	}

	/**
	 * Adds a doctor or admin as a disabled account and e-mails them a link to choose their own password
	 * (the same set-password flow patients use), instead of a shared default password.
	 */
	private AdminDto createStaff(AdminDto adminDto, String role) {
		User admin = adminDto.toEntity();
		if (adminServiceImplementation.findByEmail(admin.getEmail()) != null) {
			throw new ApiException(HttpStatus.CONFLICT, "There is already an account with this e-mail.");
		}
		admin.setRole(role);
		admin.setEnabled(false);
		admin.setConfirmationToken(UUID.randomUUID().toString());
		if (!"ROLE_DOCTOR".equals(role)) {
			admin.setSpecialization(null);
		}
		adminServiceImplementation.save(admin);

		SimpleMailMessage invite = new SimpleMailMessage();
		invite.setTo(admin.getEmail());
		invite.setSubject("Your E-Medical staff account");
		invite.setText("An administrator created an E-Medical account for you.\n"
				+ "Choose your password here:\n" + frontendUrl + "/set-password?token=" + admin.getConfirmationToken());
		emailService.sendEmail(invite);
		return new AdminDto(admin);
	}

	private List<AdminDto> accountsWithRole(String role) {
		return adminServiceImplementation.findByRole(role)
				.stream()
				.map(AdminDto::new)
				.collect(Collectors.toList());
	}

	private User updateLastSeen() {
		String username = getLoggedInUsername();
		User admin = adminServiceImplementation.findByEmail(username);
		admin.setLastseen(LocalDateTime.now().withNano(0).toString());
		adminServiceImplementation.save(admin);
		return admin;
	}

	private String getLoggedInUsername() {
		Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		if (principal instanceof UserDetails) {
			return ((UserDetails) principal).getUsername();
		} else {
			return principal.toString();
		}
	}
}
