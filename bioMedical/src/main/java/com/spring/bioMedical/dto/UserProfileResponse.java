// UserProfileResponse.java
package com.spring.bioMedical.dto;

import com.spring.bioMedical.entity.Admin;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserProfileResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;

    public UserProfileResponse(Admin admin) {
        this.id = admin.getId();
        this.firstName = admin.getFirstName();
        this.lastName = admin.getLastName();
        this.email = admin.getEmail();
    }
}