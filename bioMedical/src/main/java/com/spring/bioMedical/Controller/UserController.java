package com.spring.bioMedical.Controller;

import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.util.Date;

import com.mysql.cj.log.Log;
import com.spring.bioMedical.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import com.spring.bioMedical.dto.AppointmentRequest;
import com.spring.bioMedical.dto.AppointmentResponse;
import com.spring.bioMedical.dto.UserProfileResponse;
import com.spring.bioMedical.entity.Admin;
import com.spring.bioMedical.entity.Appointment;
import com.spring.bioMedical.service.AdminServiceImplementation;
import com.spring.bioMedical.service.AppointmentServiceImplementation;

@RestController
@RequestMapping("/api/user")
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
	public ResponseEntity<AppointmentResponse> bookAppointment(@RequestBody AppointmentRequest appointmentRequest) {
		String username = getLoggedInUsername();
		Admin admin = adminServiceImplementation.findByEmail(username);

		Appointment appointment = appointmentRequest.toEntity();
		appointment.setName(admin.getFirstName() + " " + admin.getLastName());
		appointment.setEmail(admin.getEmail());

		appointmentServiceImplementation.save(appointment);

		return ResponseEntity.status(HttpStatus.CREATED).body(new AppointmentResponse(appointment));
	}

	@GetMapping("/profile")
	public ResponseEntity<UserProfileResponse> getUserProfile() {
		updateLastSeen();
		String username = getLoggedInUsername();
		Admin admin = adminServiceImplementation.findByEmail(username);
		return ResponseEntity.ok(new UserProfileResponse(admin));
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

	@PatchMapping("/updateProfile")
	public ResponseEntity<String> setUserProfile(@RequestParam("firstName") String firstName,@RequestParam("lastName") String lastName){
		try{
			String username = getLoggedInUsername();
			Admin admin = 	adminServiceImplementation.findByEmail(username);

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