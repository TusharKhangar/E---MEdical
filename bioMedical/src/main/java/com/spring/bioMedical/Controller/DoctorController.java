package com.spring.bioMedical.Controller;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.spring.bioMedical.dto.AppointmentDto;
import com.spring.bioMedical.entity.Admin;
import com.spring.bioMedical.service.AdminServiceImplementation;
import com.spring.bioMedical.service.AppointmentServiceImplementation;
import com.spring.bioMedical.service.UserService;

/**
 * @
 */
@RestController
@RequestMapping("/api/doctor")
public class DoctorController {

	private final UserService userService;
	private final AdminServiceImplementation adminServiceImplementation;
	private final AppointmentServiceImplementation appointmentServiceImplementation;

	@Autowired
	public DoctorController(UserService userService, AdminServiceImplementation obj, AppointmentServiceImplementation app) {
		this.userService = userService;
		this.adminServiceImplementation = obj;
		this.appointmentServiceImplementation = app;
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

	@GetMapping("/profile")
	public ResponseEntity<Admin> getDoctorProfile() {
		updateLastSeen();
		String username = getLoggedInUsername();
		Admin admin = adminServiceImplementation.findByEmail(username);
		return ResponseEntity.ok(admin);
	}

	private void updateLastSeen() {
		String username = getLoggedInUsername();
		Admin admin = adminServiceImplementation.findByEmail(username);
		SimpleDateFormat formatter = new SimpleDateFormat("dd/MM/yyyy HH:mm:ss");
		Date now = new Date();
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