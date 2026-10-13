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
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.spring.bioMedical.dto.AdminDto;
import com.spring.bioMedical.dto.AppointmentDto;
import com.spring.bioMedical.entity.Appointment;
import com.spring.bioMedical.entity.DoctorLeave;
import com.spring.bioMedical.entity.User;
import com.spring.bioMedical.exception.ApiException;
import com.spring.bioMedical.service.AdminServiceImplementation;
import com.spring.bioMedical.service.AppointmentServiceImplementation;
import com.spring.bioMedical.service.ScheduleService;

/**
 * @
 */
@RestController
@RequestMapping("/api/doctor")
@io.swagger.v3.oas.annotations.tags.Tag(name = "Doctors (ROLE_DOCTOR)")
@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = "bearer")
public class DoctorController {

	private final AdminServiceImplementation adminServiceImplementation;
	private final AppointmentServiceImplementation appointmentServiceImplementation;
	private final ScheduleService scheduleService;

	@Autowired
	public DoctorController(AdminServiceImplementation obj, AppointmentServiceImplementation app,
			ScheduleService scheduleService) {
		this.adminServiceImplementation = obj;
		this.appointmentServiceImplementation = app;
		this.scheduleService = scheduleService;
	}

	/** The signed-in doctor's working hours, Monday to Sunday. */
	@GetMapping("/schedule")
	public ResponseEntity<List<ScheduleService.Day>> getSchedule() {
		return ResponseEntity.ok(scheduleService.weeklySchedule(me().getId()));
	}

	/** Replace working hours. Body: [{"dayOfWeek":1,"working":true,"startTime":"09:00","endTime":"17:00"}, ...]. */
	@PutMapping("/schedule")
	public ResponseEntity<List<ScheduleService.Day>> updateSchedule(@RequestBody List<ScheduleService.Day> days) {
		return ResponseEntity.ok(scheduleService.updateWeeklySchedule(me().getId(), days));
	}

	@GetMapping("/leave")
	public ResponseEntity<List<DoctorLeave>> getLeave() {
		return ResponseEntity.ok(scheduleService.upcomingLeave(me().getId()));
	}

	/** Take a day off. Body: {"date": "2026-11-02", "reason": "Conference"}. */
	@PostMapping("/leave")
	public ResponseEntity<DoctorLeave> addLeave(@RequestBody Map<String, String> body) {
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(scheduleService.addLeave(me().getId(), body.get("date"), body.get("reason")));
	}

	@DeleteMapping("/leave/{id}")
	public ResponseEntity<Void> removeLeave(@PathVariable Long id) {
		scheduleService.removeLeave(me().getId(), id);
		return ResponseEntity.noContent().build();
	}

	private User me() {
		return adminServiceImplementation.findByEmail(getLoggedInUsername());
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
