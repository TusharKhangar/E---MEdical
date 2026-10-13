package com.spring.bioMedical.dto;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** What a doctor submits when finishing a visit. */
public record PrescriptionRequest(
		@NotBlank(message = "Please enter a diagnosis") @Size(max = 500, message = "Please keep the diagnosis under 500 characters") String diagnosis,
		@Size(max = 2000, message = "Please keep the notes under 2000 characters") String notes,
		@Pattern(regexp = "^$|^\\d{4}-\\d{2}-\\d{2}$", message = "Please choose a valid follow-up date") String followUpDate,
		@Size(max = 20, message = "A prescription can list at most 20 medicines") List<@Valid MedicineLine> medicines) {

	public record MedicineLine(
			@NotBlank(message = "Each medicine needs a name") @Size(max = 120) String name,
			@Size(max = 60) String dosage,
			@Size(max = 120) String frequency,
			@Min(value = 1, message = "Duration must be at least 1 day") @Max(value = 365, message = "Duration must be under a year") Integer durationDays) {
	}
}
