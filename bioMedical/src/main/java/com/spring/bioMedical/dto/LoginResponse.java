package com.spring.bioMedical.dto;

import com.spring.bioMedical.entity.User;

import lombok.Getter;
import lombok.Setter;

/** The JWT plus who signed in, so the frontend can route by role without another request. */
@Getter
@Setter
public class LoginResponse {
    private String jwt;
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String role;

    public LoginResponse(String jwt) {
        this.jwt = jwt;
    }

    public LoginResponse(String jwt, User user) {
        this.jwt = jwt;
        this.id = user.getId();
        this.email = user.getEmail();
        this.firstName = user.getFirstName();
        this.lastName = user.getLastName();
        this.role = user.getRole();
    }
}
