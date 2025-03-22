// AppointmentRequest.java
package com.spring.bioMedical.dto;

import com.spring.bioMedical.entity.Appointment;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Data
public class AppointmentRequest {
    private String date;
    private String time;
    private String description;

    public Appointment toEntity(){
        Appointment app = new Appointment();
        app.setDate(this.date);
        app.setTime(this.time);
        app.setDescription(this.description);
        return app;
    }
}



