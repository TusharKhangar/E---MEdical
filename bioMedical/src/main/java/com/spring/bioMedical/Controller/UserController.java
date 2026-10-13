package com.spring.bioMedical.Controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import com.spring.bioMedical.dto.AppointmentDto;
import com.spring.bioMedical.dto.AppointmentRequest;
import com.spring.bioMedical.dto.UserProfileResponse;
import com.spring.bioMedical.entity.User;
import com.spring.bioMedical.entity.Appointment;
import com.spring.bioMedical.exception.ApiException;
import com.spring.bioMedical.service.AdminServiceImplementation;
import com.spring.bioMedical.service.AppointmentServiceImplementation;

import jakarta.validation.Valid;

/** Endpoints for patients (ROLE_USER). */
@RestController
@RequestMapping("/api/user")
@io.swagger.v3.oas.annotations.tags.Tag(name = "Patients (ROLE_USER)")
@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = "bearer")
public class UserController {

	private static final Logger logger = LoggerFactory.getLogger(UserController.class);
	private final AppointmentServiceImplementation appointmentServiceImplementation;
	private final AdminServiceImplementation adminServiceImplementation;

	@Autowired
	public UserController(AppointmentServiceImplementation appointmentServiceImplementation, AdminServiceImplementation adminServiceImplementation) {
		this.appointmentServiceImplementation = appointmentServiceImplementation;
		this.adminServiceImplementation = adminServiceImplementation;
	}

	@PostMapping("/appointments")
	public ResponseEntity<AppointmentDto> bookAppointment(@Valid @RequestBody AppointmentRequest appointmentRequest) {
		User patient = adminServiceImplementation.findByEmail(getLoggedInUsername());
		User doctor = adminServiceImplementation.findDoctorById(appointmentRequest.getDoctorId());

		Appointment appointment = appointmentServiceImplementation.book(patient, doctor, appointmentRequest.getDate(),
				appointmentRequest.getTime(), appointmentRequest.getDescription());

		return ResponseEntity.status(HttpStatus.CREATED).body(new AppointmentDto(appointment));
	}

	@GetMapping("/appointments")
	public ResponseEntity<List<AppointmentDto>> getMyAppointments() {
		List<AppointmentDto> appointments = appointmentServiceImplementation.findByPatientEmail(getLoggedInUsername())
				.stream()
				.map(AppointmentDto::new)
				.toList();
		return ResponseEntity.ok(appointments);
	}

	@PatchMapping("/appointments/{id}/cancel")
	public ResponseEntity<AppointmentDto> cancelAppointment(@PathVariable Long id) {
		Appointment appointment = appointmentServiceImplementation.findById(id)
				.filter(a -> getLoggedInUsername().equalsIgnoreCase(a.getEmail()))
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Appointment not found"));
		return ResponseEntity.ok(new AppointmentDto(
				appointmentServiceImplementation.changeStatus(appointment, Appointment.CANCELLED, true)));
	}

	/** Move one of my appointments to another free slot with the same doctor. Body: {"date": "...", "time": "10:00"}. */
	@PatchMapping("/appointments/{id}/reschedule")
	public ResponseEntity<AppointmentDto> rescheduleAppointment(@PathVariable Long id, @RequestBody Map<String, String> body) {
		User patient = adminServiceImplementation.findByEmail(getLoggedInUsername());
		Appointment appointment = appointmentServiceImplementation.findById(id)
				.filter(a -> patient.getEmail().equalsIgnoreCase(a.getEmail()))
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Appointment not found"));
		User doctor = adminServiceImplementation.findDoctorById(appointment.getDoctorId());
		return ResponseEntity.ok(new AppointmentDto(appointmentServiceImplementation.reschedule(
				appointment, patient, doctor, body.get("date"), body.get("time"))));
	}

	@GetMapping("/profile")
	public ResponseEntity<UserProfileResponse> getUserProfile() {
		updateLastSeen();
		String username = getLoggedInUsername();
		User admin = adminServiceImplementation.findByEmail(username);
		return ResponseEntity.ok(new UserProfileResponse(admin));
	}

	private void updateLastSeen() {
		String username = getLoggedInUsername();
		User admin = adminServiceImplementation.findByEmail(username);
		admin.setLastseen(LocalDateTime.now().withNano(0).toString());
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

	@PatchMapping("/updateProfile")
	public ResponseEntity<String> setUserProfile(@RequestParam("firstName") String firstName,@RequestParam("lastName") String lastName){
		try{
			String username = getLoggedInUsername();
			User admin = 	adminServiceImplementation.findByEmail(username);

			if (admin != null){
				admin.setFirstName(firstName);
				admin.setLastName(lastName);
				admin.setLastseen(String.valueOf(LocalDateTime.now()));
				adminServiceImplementation.save(admin);
				return ResponseEntity.ok("Profile Updated Successfully");
			}else {
				logger.debug("User is not found : {}",username);
				return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User Not Found");
			}

		}catch (Exception e ){
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error updating Profile : "+ e.getMessage());
		}
	}

}
