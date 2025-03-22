// AppointmentResponse.java
package com.spring.bioMedical.dto;

import com.spring.bioMedical.entity.Appointment;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AppointmentResponse {
    private Long id;
    private String name;
    private String email;
    private String date;
    private String time;
    private String description;

    public AppointmentResponse(Appointment appointment) {
        this.id = appointment.getId();
        this.name = appointment.getName();
        this.email = appointment.getEmail();
        this.date = appointment.getDate();
        this.time = appointment.getTime();
        this.description = appointment.getDescription();
    }
}