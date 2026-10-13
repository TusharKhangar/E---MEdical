package com.spring.bioMedical.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ContactRequest(
		@NotBlank(message = "Please provide your name") @Size(max = 120, message = "Name is too long") String name,
		@NotBlank(message = "Please provide your e-mail") @Email(message = "Please provide a valid e-mail") String email,
		@Size(max = 60, message = "Subject is too long") String subject,
		@NotBlank(message = "Please write a message") @Size(max = 2000, message = "Please keep the message under 2000 characters") String message) {
}
