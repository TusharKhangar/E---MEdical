// UserProfileResponse.java
package com.spring.bioMedical.dto;

import com.spring.bioMedical.entity.User;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserProfileResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private String gender;
    private String role;
    private String specialization;
    private String lastseen;

    public UserProfileResponse(User admin) {
        this.id = admin.getId();
        this.firstName = admin.getFirstName();
        this.lastName = admin.getLastName();
        this.email = admin.getEmail();
        this.phoneNumber = admin.getPhoneNumber();
        this.gender = admin.getGender();
        this.role = admin.getRole();
        this.specialization = admin.getSpecialization();
        this.lastseen = admin.getLastseen();
    }
}
