// AppointmentRequest.java
package com.spring.bioMedical.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AppointmentRequest {

    @NotNull(message = "Please choose a doctor")
    private Long doctorId;

    // yyyy-MM-dd
    @NotBlank(message = "Please choose a date")
    private String date;

    // HH:mm
    @NotBlank(message = "Please choose a time")
    private String time;

    @Size(max = 255, message = "Please keep the description under 255 characters")
    private String description;
}
