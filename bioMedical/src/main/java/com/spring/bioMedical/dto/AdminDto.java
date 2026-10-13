package com.spring.bioMedical.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.spring.bioMedical.entity.User;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * An account as shown in the admin and doctor screens, and the body for adding a doctor or admin.
 * Password hashes and confirmation tokens are never sent to or accepted from the client.
 */
@Getter
@Setter
public class AdminDto {

    private Long id;

    @Email(message = "Please provide a valid e-mail")
    @NotEmpty(message = "Please provide an e-mail")
    private String email;

    @NotBlank(message = "Please provide a first name")
    private String firstName;

    @NotBlank(message = "Please provide a last name")
    private String lastName;

    private boolean enabled;
    private String gender;
    private String phoneNumber;
    private String specialization;
    private String role;
    private String lastseen;

    // Only in the response to adding staff, and only in demo mode
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String inviteLink;

    public AdminDto() {
    }

    public AdminDto(User admin) {
        this.id = admin.getId();
        this.email = admin.getEmail();
        this.firstName = admin.getFirstName();
        this.lastName = admin.getLastName();
        this.enabled = admin.getEnabled();
        this.gender = admin.getGender();
        this.phoneNumber = admin.getPhoneNumber();
        this.specialization = admin.getSpecialization();
        this.role = admin.getRole();
        this.lastseen = admin.getLastseen();
    }

    /** A new account from this DTO. Role, enabled flag and token are set by the caller. */
    public User toEntity() {
        User admin = new User();
        admin.setEmail(this.email == null ? null : this.email.trim().toLowerCase());
        admin.setFirstName(this.firstName);
        admin.setLastName(this.lastName);
        admin.setGender(this.gender);
        admin.setPhoneNumber(this.phoneNumber);
        admin.setSpecialization(this.specialization);
        return admin;
    }
}
