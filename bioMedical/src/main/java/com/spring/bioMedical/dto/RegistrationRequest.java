// RegistrationRequest.java
package com.spring.bioMedical.dto;

import com.spring.bioMedical.entity.User;
import lombok.Getter;
import lombok.Setter;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;

/** Patient sign-up form. The password is chosen later, from the link in the confirmation e-mail. */
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

    @NotEmpty(message = "Please provide your phone number")
    @Pattern(regexp = "^[1-9][0-9]{9}$", message = "Please provide a 10-digit phone number")
    private String phoneNumber;

    public User toEntity() {
        User user = new User();
        user.setEmail(this.email.trim().toLowerCase());
        user.setFirstName(this.firstName.trim());
        user.setLastName(this.lastName.trim());
        user.setGender(this.gender);
        user.setPhoneNumber(this.phoneNumber);
        return user;
    }
}
