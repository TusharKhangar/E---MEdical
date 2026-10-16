package com.spring.bioMedical.Controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.spring.bioMedical.dto.AdminDto;
import com.spring.bioMedical.service.AdminServiceImplementation;
import com.spring.bioMedical.service.AppointmentServiceImplementation;
import com.spring.bioMedical.service.DirectoryService;

/** Read-only endpoints anyone can call: the doctor directory and free appointment slots. */
@RestController
@RequestMapping("/api/doctors")
@io.swagger.v3.oas.annotations.tags.Tag(name = "Doctor directory")
public class PublicController {

	private final AdminServiceImplementation adminServiceImplementation;
	private final AppointmentServiceImplementation appointmentServiceImplementation;
	private final DirectoryService directory;

	public PublicController(AdminServiceImplementation adminServiceImplementation,
			AppointmentServiceImplementation appointmentServiceImplementation, DirectoryService directory) {
		this.adminServiceImplementation = adminServiceImplementation;
		this.appointmentServiceImplementation = appointmentServiceImplementation;
		this.directory = directory;
	}

	/** Active doctors, optionally filtered by specialization (department). */
	@GetMapping
	public ResponseEntity<List<AdminDto>> getDoctors(@RequestParam(required = false) String specialization) {
		List<AdminDto> doctors = directory.activeDoctors().stream()
				.filter(d -> specialization == null || specialization.isBlank()
						|| specialization.equalsIgnoreCase(d.getSpecialization()))
				.toList();
		return ResponseEntity.ok(doctors);
	}

	/** Free time slots for a doctor on a date (yyyy-MM-dd). */
	@GetMapping("/{id}/slots")
	public ResponseEntity<Map<String, Object>> getSlots(@PathVariable Long id, @RequestParam String date) {
		adminServiceImplementation.findDoctorById(id);
		return ResponseEntity.ok(Map.of("doctorId", id, "date", date,
				"slots", appointmentServiceImplementation.availableSlots(id, date)));
	}
}
