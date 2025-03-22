package com.spring.bioMedical.Controller;

import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import com.spring.bioMedical.dto.AdminDto;
import com.spring.bioMedical.dto.AppointmentDto;
import com.spring.bioMedical.entity.Admin;
import com.spring.bioMedical.entity.Appointment;
import com.spring.bioMedical.service.AdminServiceImplementation;
import com.spring.bioMedical.service.AppointmentServiceImplementation;
import com.spring.bioMedical.service.UserService;

/**
 * @
 */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

	private final UserService userService;
	private final AdminServiceImplementation adminServiceImplementation;
	private final AppointmentServiceImplementation appointmentServiceImplementation;

	@Autowired
	public AdminController(UserService userService, AdminServiceImplementation obj, AppointmentServiceImplementation app) {
		this.userService = userService;
		this.adminServiceImplementation = obj;
		this.appointmentServiceImplementation = app;
	}

	@GetMapping("/users")
	public ResponseEntity<List<AdminDto>> getUsers() {
		updateLastSeen();
		List<AdminDto> users = adminServiceImplementation.findByRole("ROLE_USER")
				.stream()
				.map(AdminDto::new)
				.collect(Collectors.toList());
		return ResponseEntity.ok(users);
	}

	@GetMapping("/doctors")
	public ResponseEntity<List<AdminDto>> getDoctors() {
		updateLastSeen();
		List<AdminDto> doctors = adminServiceImplementation.findByRole("ROLE_DOCTOR")
				.stream()
				.map(AdminDto::new)
				.collect(Collectors.toList());
		return ResponseEntity.ok(doctors);
	}

	@GetMapping("/admins")
	public ResponseEntity<List<AdminDto>> getAdmins() {
		updateLastSeen();
		List<AdminDto> admins = adminServiceImplementation.findByRole("ROLE_ADMIN")
				.stream()
				.map(AdminDto::new)
				.collect(Collectors.toList());
		return ResponseEntity.ok(admins);
	}

	@PostMapping("/doctors")
	public ResponseEntity<AdminDto> addDoctor(@RequestBody AdminDto adminDto) {
		Admin admin = adminDto.toEntity();
		admin.setRole("ROLE_DOCTOR");
		admin.setPassword("default");
		admin.setEnabled(true);
		admin.setConfirmationToken("ByAdmin-Panel");
		adminServiceImplementation.save(admin);
		return ResponseEntity.status(HttpStatus.CREATED).body(new AdminDto(admin));
	}

	@PostMapping("/admins")
	public ResponseEntity<AdminDto> addAdmin(@RequestBody AdminDto adminDto) {
		Admin admin = adminDto.toEntity();
		admin.setRole("ROLE_ADMIN");
		admin.setPassword("default");
		admin.setEnabled(true);
		admin.setConfirmationToken("ByAdmin-Panel");
		adminServiceImplementation.save(admin);
		return ResponseEntity.status(HttpStatus.CREATED).body(new AdminDto(admin));
	}

	@GetMapping("/profile")
	public ResponseEntity<AdminDto> getMyProfile() {
		String username = getLoggedInUsername();
		Admin admin = adminServiceImplementation.findByEmail(username);
		updateLastSeen();
		return ResponseEntity.ok(new AdminDto(admin));
	}

	@PutMapping("/profile")
	public ResponseEntity<AdminDto> updateProfile(@RequestBody AdminDto adminDto) {
		Admin admin = adminDto.toEntity();
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

	private void updateLastSeen() {
		String username = getLoggedInUsername();
		Admin admin = adminServiceImplementation.findByEmail(username);
		SimpleDateFormat formatter = new SimpleDateFormat("dd/MM/yyyy HH:mm:ss");
		var now = 	LocalDateTime.now();
		String log = now.toString();
		admin.setLastseen(log);
		adminServiceImplementation.save(admin);
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