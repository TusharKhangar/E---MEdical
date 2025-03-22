// ConfirmationResponse.java
package com.spring.bioMedical.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class ConfirmationResponse {
    private String token;
    private String message;
}