package com.spring.bioMedical.entity;

import  jakarta.persistence.Column;
import  jakarta.persistence.Entity;
import  jakarta.persistence.GeneratedValue;
import  jakarta.persistence.GenerationType;
import  jakarta.persistence.Id;
import  jakarta.persistence.Table;
import  jakarta.validation.constraints.Email;
import  jakarta.validation.constraints.NotEmpty;

import lombok.*;
import org.springframework.data.annotation.Transient;

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
//	@Transient
	private String password;
	
	@Getter
    @Column(name = "first_name")
	@NotEmpty(message = "Please provide your first name")
	private String firstName;
	
	@Getter
    @Column(name = "last_name")
	@NotEmpty(message = "Please provide your last name")
	private String lastName;
	
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
//    @Column(name = "lastseen")
//	@Transient
	private String lastseen;


    public boolean getEnabled() {
		return enabled;
	}

    @Override
	public String toString() {
		return "User [id=" + id + ", email=" + email + ", password=" + password + ", firstName=" + firstName
				+ ", lastName=" + lastName + ", enabled=" + enabled + ", confirmationToken=" + confirmationToken
				+ ", gender=" + gender + ", role=" + role + ", lastseen=" + lastseen + "]";
	}



}