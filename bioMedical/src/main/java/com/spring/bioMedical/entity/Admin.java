package com.spring.bioMedical.entity;

import jakarta.persistence.*;
import javax.validation.constraints.Email;
import javax.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "user")
@Getter
@Setter
@ToString
public class Admin {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)  // ✅ Use IDENTITY for better DB support
	private Long id;

	@Column(name = "username", nullable = false, unique = true)
	@Email(message = "Please provide a valid e-mail")  // ✅ Email validation (if username is an email)
	@NotEmpty(message = "Please provide an e-mail")
	private String email; // Consider renaming to `username` if it's used for login

	@Column(name = "password")
	private String password; // ✅ Removed @Transient so it gets stored in DB

	@Column(name = "first_name")
	@NotEmpty(message = "Please provide your first name")
	private String firstName;

	@Column(name = "last_name")
	@NotEmpty(message = "Please provide your last name")
	private String lastName;

	@Column(name = "enabled")
	private boolean enabled;

	@Column(name = "confirmation_token")
	private String confirmationToken;

	@Column(name = "gender")
	private String gender;

	@Column(name = "authority")
	private String role;

	@Transient  // ✅ Last seen is not stored in DB
	private String lastseen;
}
