// RegistrationRequest.java
package com.spring.bioMedical.dto;

import com.spring.bioMedical.entity.User;
import lombok.Getter;
import lombok.Setter;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotEmpty;

@Getter
@Setter
public class RegistrationRequest {

    @Email(message = "Please provide a valid e-mail")
    @NotEmpty(message = "Please provide an e-mail")
    private String email;

    @NotEmpty(message = "Please provide your first name")
    private String firstName;

    @NotEmpty(message = "Please provide your last name")
    private String lastName;

    private String gender;

    public User toEntity() {
        User user = new User();
        user.setEmail(this.email);
        user.setFirstName(this.firstName);
        user.setLastName(this.lastName);
        user.setGender(this.gender);
        return user;
    }
}