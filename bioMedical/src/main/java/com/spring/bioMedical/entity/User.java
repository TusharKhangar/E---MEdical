package com.spring.bioMedical.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import lombok.*;
import jakarta.persistence.Transient;

/**
 *
 * @
 *
 *
 */
@Setter
@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "user")
public class User {

	@Getter
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	@Column(name = "id")
	private Long id;

	@Getter
	@Column(name = "username", nullable = false, unique = true)
	@Email(message = "Please provide a valid e-mail")
	@NotEmpty(message = "Please provide an e-mail")
	private String email;

	@Getter
	@Column(name = "password")
	private String password;

	// Added for password confirmation in registration (not persisted).
	@Transient
	private String confirmPassword;

	@Getter
	@Column(name = "first_name")
	@NotEmpty(message = "Please provide your first name")
	private String firstName;

	@Getter
	@Column(name = "last_name")
	@NotEmpty(message = "Please provide your last name")
	private String lastName;

	// Added for phone number.
	@Getter
	@Column(name = "phone_number")
	private String phoneNumber;

	@Column(name = "enabled")
	private boolean enabled;

	@Getter
	@Column(name = "confirmation_token")
	private String confirmationToken;

	@Getter
	@Column(name = "gender")
	private String gender;

	@Getter
	@Column(name = "authority")
	private String role;

	@Getter
	private String lastseen;

	// Doctors only: the department they work in, e.g. "Cardiology".
	@Getter
	@Column(name = "specialization")
	private String specialization;

	public boolean getEnabled() {
		return enabled;
	}

	@Override
	public String toString() {
		// Password and confirmation token are left out on purpose: this string ends up in logs.
		return "User [id=" + id + ", email=" + email + ", firstName=" + firstName + ", lastName=" + lastName
				+ ", phoneNumber=" + phoneNumber + ", enabled=" + enabled + ", gender=" + gender + ", role=" + role
				+ ", specialization=" + specialization + ", lastseen=" + lastseen + "]";
	}
}
