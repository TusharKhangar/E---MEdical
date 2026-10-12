// ConfirmationRequest.java
package com.spring.bioMedical.dto;

import lombok.Getter;
import lombok.Setter;

import jakarta.validation.constraints.NotEmpty;

@Getter
@Setter
public class ConfirmationRequest {
    @NotEmpty(message = "Token is required")
    private String token;

    @NotEmpty(message = "Password is required")
    private String password;
}
