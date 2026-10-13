package com.spring.bioMedical.Controller;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import com.spring.bioMedical.dto.AdminDto;
import com.spring.bioMedical.dto.AppointmentDto;
import com.spring.bioMedical.dto.PageResponse;
import com.spring.bioMedical.entity.User;
import com.spring.bioMedical.entity.Appointment;
import com.spring.bioMedical.entity.ContactMessage;
import com.spring.bioMedical.repository.ContactMessageRepository;
import com.spring.bioMedical.service.DemoMode;
import com.spring.bioMedical.exception.ApiException;
import com.spring.bioMedical.service.AdminServiceImplementation;
import com.spring.bioMedical.service.AppointmentServiceImplementation;
import com.spring.bioMedical.service.AnalyticsService;
import com.spring.bioMedical.service.EmailService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

/**
 * @
 */
@RestController
@RequestMapping("/api/admin")
@Tag(name = "Administration (ROLE_ADMIN)")
@SecurityRequirement(name = "bearer")
public class AdminController {

	private final AdminServiceImplementation adminServiceImplementation;
	private final AppointmentServiceImplementation appointmentServiceImplementation;
	private final EmailService emailService;
	private final ContactMessageRepository contactMessages;
	private final DemoMode demoMode;
	private final AnalyticsService analyticsService;

	@Value("${app.frontend-url:http://localhost:5173}")
	private String frontendUrl;

	@Autowired
	public AdminController(AdminServiceImplementation obj, AppointmentServiceImplementation app, EmailService emailService,
			ContactMessageRepository contactMessages, DemoMode demoMode, AnalyticsService analyticsService) {
		this.adminServiceImplementation = obj;
		this.appointmentServiceImplementation = app;
		this.emailService = emailService;
		this.contactMessages = contactMessages;
		this.demoMode = demoMode;
		this.analyticsService = analyticsService;
	}

	/** Messages sent through the public Contact page, newest first. */
	@GetMapping("/messages")
	public ResponseEntity<List<ContactMessage>> getMessages() {
		return ResponseEntity.ok(contactMessages.findAllByOrderByCreatedAtDesc());
	}

	/** Mark a contact message as handled. Body: {"handled": true}. */
	@PatchMapping("/messages/{id}")
	public ResponseEntity<ContactMessage> setMessageHandled(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
		ContactMessage message = contactMessages.findById(id)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Message not found"));
		message.setHandled(Boolean.TRUE.equals(body.get("handled")));
		return ResponseEntity.ok(contactMessages.save(message));
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
		if (demoMode.isProtectedAccount(user.getEmail())) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "The shared demo accounts can't be disabled.");
		}
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
	 * Server-side search for the appointments table: free text (patient, e-mail, doctor, department),
	 * status, doctor and date range, one page at a time. Sorted by visit date (newest first), or by when
	 * it was booked (sort=booked), or soonest first (sort=soonest).
	 */
	@GetMapping("/appointments/search")
	public ResponseEntity<PageResponse<AppointmentDto>> searchAppointments(@RequestParam(required = false) String q,
			@RequestParam(required = false) String status, @RequestParam(required = false) Long doctorId,
			@RequestParam(required = false) String from, @RequestParam(required = false) String to,
			@RequestParam(defaultValue = "date") String sort, @RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "20") int size) {
		Sort order = switch (sort) {
			case "booked" -> Sort.by(Sort.Order.desc("regtime"), Sort.Order.desc("id"));
			case "soonest" -> Sort.by(Sort.Order.asc("date"), Sort.Order.asc("time"));
			default -> Sort.by(Sort.Order.desc("date"), Sort.Order.desc("time"));
		};
		var result = appointmentServiceImplementation.search(like(q), blankToNull(status), doctorId, blankToNull(from),
				blankToNull(to), pageRequest(page, size, order));
		return ResponseEntity.ok(PageResponse.of(result, AppointmentDto::new));
	}

	/** Server-side search for the patients, doctors and admins tables. role is USER, DOCTOR or ADMIN. */
	@GetMapping("/accounts")
	public ResponseEntity<PageResponse<AdminDto>> searchAccounts(@RequestParam String role,
			@RequestParam(required = false) String q, @RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "20") int size) {
		String fullRole = "ROLE_" + role.toUpperCase().replace("ROLE_", "");
		if (!List.of("ROLE_USER", "ROLE_DOCTOR", "ROLE_ADMIN").contains(fullRole)) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "role must be USER, DOCTOR or ADMIN");
		}
		var result = adminServiceImplementation.search(fullRole, like(q),
				pageRequest(page, size, Sort.by("firstName", "lastName")));
		return ResponseEntity.ok(PageResponse.of(result, AdminDto::new));
	}

	private static PageRequest pageRequest(int page, int size, Sort sort) {
		return PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100), sort);
	}

	private static String blankToNull(String s) {
		return s == null || s.isBlank() ? null : s.trim();
	}

	/** "  Smith " becomes "%smith%" for a case-insensitive contains match; blank means no filter. */
	private static String like(String q) {
		String t = blankToNull(q);
		return t == null ? null : "%" + t.toLowerCase().replace("%", "").replace("_", "") + "%";
	}

	/** Charts for the analytics page: bookings per day, status, department, hour and busiest doctors. */
	@GetMapping("/analytics")
	public ResponseEntity<AnalyticsService.Analytics> getAnalytics(@RequestParam(defaultValue = "30") int days) {
		return ResponseEntity.ok(analyticsService.forLastDays(days));
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

		String link = frontendUrl + "/set-password?token=" + admin.getConfirmationToken();
		SimpleMailMessage invite = new SimpleMailMessage();
		invite.setTo(admin.getEmail());
		invite.setSubject("Your E-Medical staff account");
		invite.setText("An administrator created an E-Medical account for you.\n"
				+ "Choose your password here:\n" + link);
		emailService.sendEmail(invite);
		AdminDto created = new AdminDto(admin);
		created.setInviteLink(demoMode.expose(link));
		return created;
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
