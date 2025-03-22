package com.spring.bioMedical.dto;

import com.spring.bioMedical.entity.Admin;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminDto {

    private Long id;
    private String email;
    private String password;
    private String firstName;
    private String lastName;
    private boolean enabled;
    private String confirmationToken;
    private String gender;
    private String role;
    private String lastseen;

    public AdminDto() {
    }

    public AdminDto(Admin admin) {
        this.id = admin.getId();
        this.email = admin.getEmail();
        this.password = admin.getPassword();
        this.firstName = admin.getFirstName();
        this.lastName = admin.getLastName();
        this.enabled = admin.isEnabled();
        this.confirmationToken = admin.getConfirmationToken();
        this.gender = admin.getGender();
        this.role = admin.getRole();
        this.lastseen = admin.getLastseen();
    }

    public Admin toEntity() {
        Admin admin = new Admin();
        admin.setId(this.id);
        admin.setEmail(this.email);
        admin.setPassword(this.password);
        admin.setFirstName(this.firstName);
        admin.setLastName(this.lastName);
        admin.setEnabled(this.enabled);
        admin.setConfirmationToken(this.confirmationToken);
        admin.setGender(this.gender);
        admin.setRole(this.role);
        return admin;
    }
}