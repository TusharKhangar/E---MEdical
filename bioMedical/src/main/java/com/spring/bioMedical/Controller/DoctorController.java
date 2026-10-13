package com.spring.bioMedical.Controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.spring.bioMedical.dto.AdminDto;
import com.spring.bioMedical.dto.AppointmentDto;
import com.spring.bioMedical.entity.Appointment;
import com.spring.bioMedical.entity.User;
import com.spring.bioMedical.exception.ApiException;
import com.spring.bioMedical.service.AdminServiceImplementation;
import com.spring.bioMedical.service.AppointmentServiceImplementation;

/**
 * @
 */
@RestController
@RequestMapping("/api/doctor")
public class DoctorController {

	private final AdminServiceImplementation adminServiceImplementation;
	private final AppointmentServiceImplementation appointmentServiceImplementation;

	@Autowired
	public DoctorController(AdminServiceImplementation obj, AppointmentServiceImplementation app) {
		this.adminServiceImplementation = obj;
		this.appointmentServiceImplementation = app;
	}

	/** Appointments booked with the signed-in doctor. */
	@GetMapping("/appointments")
	public ResponseEntity<List<AppointmentDto>> getAppointments() {
		User doctor = updateLastSeen();
		List<AppointmentDto> appointments = appointmentServiceImplementation.findByDoctorId(doctor.getId())
				.stream()
				.map(AppointmentDto::new)
				.collect(Collectors.toList());
		return ResponseEntity.ok(appointments);
	}

	/** Confirm, complete or cancel one of the doctor's own appointments. Body: {"status": "CONFIRMED"}. */
	@PatchMapping("/appointments/{id}/status")
	public ResponseEntity<AppointmentDto> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
		User doctor = adminServiceImplementation.findByEmail(getLoggedInUsername());
		Appointment appointment = appointmentServiceImplementation.findById(id)
				.filter(a -> doctor.getId().equals(a.getDoctorId()))
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Appointment not found"));
		String status = String.valueOf(body.get("status")).toUpperCase();
		return ResponseEntity.ok(new AppointmentDto(appointmentServiceImplementation.changeStatus(appointment, status)));
	}

	@GetMapping("/profile")
	public ResponseEntity<AdminDto> getDoctorProfile() {
		return ResponseEntity.ok(new AdminDto(updateLastSeen()));
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
