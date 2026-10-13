package com.spring.bioMedical.Controller;

import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.spring.bioMedical.dto.PrescriptionDto;
import com.spring.bioMedical.dto.PrescriptionRequest;
import com.spring.bioMedical.entity.User;
import com.spring.bioMedical.exception.ApiException;
import com.spring.bioMedical.service.AdminServiceImplementation;
import com.spring.bioMedical.service.PrescriptionPdf;
import com.spring.bioMedical.service.PrescriptionService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

/** Visit notes and prescriptions, attached to an appointment. */
@RestController
@RequestMapping("/api/appointments/{appointmentId}/prescription")
@Tag(name = "Prescriptions")
@SecurityRequirement(name = "bearer")
public class PrescriptionController {

	private final PrescriptionService prescriptionService;
	private final PrescriptionPdf pdf;
	private final AdminServiceImplementation users;

	public PrescriptionController(PrescriptionService prescriptionService, PrescriptionPdf pdf,
			AdminServiceImplementation users) {
		this.prescriptionService = prescriptionService;
		this.pdf = pdf;
		this.users = users;
	}

	@GetMapping
	@Operation(summary = "Read the prescription (the patient, their doctor or an admin)")
	public ResponseEntity<PrescriptionDto> get(@PathVariable Long appointmentId) {
		return ResponseEntity.ok(prescriptionService.get(me(), appointmentId));
	}

	@PutMapping
	@Operation(summary = "Write or update the prescription (the treating doctor)",
			description = "Allowed for confirmed or completed visits; a confirmed visit becomes completed.")
	public ResponseEntity<PrescriptionDto> save(@PathVariable Long appointmentId,
			@Valid @RequestBody PrescriptionRequest request) {
		User me = me();
		if (!"ROLE_DOCTOR".equals(me.getRole())) {
			throw new ApiException(org.springframework.http.HttpStatus.FORBIDDEN, "Only the treating doctor can write a prescription.");
		}
		return ResponseEntity.ok(prescriptionService.save(me, appointmentId, request));
	}

	@GetMapping(value = "/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
	@Operation(summary = "Download the prescription as a PDF")
	public ResponseEntity<byte[]> download(@PathVariable Long appointmentId) {
		PrescriptionDto p = prescriptionService.get(me(), appointmentId);
		String filename = "prescription-" + p.visitDate() + "-" + appointmentId + ".pdf";
		return ResponseEntity.ok()
				.header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment().filename(filename).build().toString())
				.contentType(MediaType.APPLICATION_PDF)
				.body(pdf.render(p));
	}

	private User me() {
		return users.findByEmail(SecurityContextHolder.getContext().getAuthentication().getName());
	}
}
