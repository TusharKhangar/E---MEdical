package com.spring.bioMedical.dto;

import com.spring.bioMedical.entity.Appointment;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AppointmentDto {

    private Long id;
    private String name;
    private String email;
    private String date;
    private String time;
    private String description;
    private String regtime;

    public AppointmentDto() {
    }

    public AppointmentDto(Appointment appointment) {
        this.id = appointment.getId();
        this.name = appointment.getName();
        this.email = appointment.getEmail();
        this.date = appointment.getDate();
        this.time = appointment.getTime();
        this.description = appointment.getDescription();
        this.regtime = appointment.getRegtime();
    }

    public Appointment toEntity() {
        Appointment appointment = new Appointment();
        appointment.setId(this.id);
        appointment.setName(this.name);
        appointment.setEmail(this.email);
        appointment.setDate(this.date);
        appointment.setTime(this.time);
        appointment.setDescription(this.description);
        appointment.setRegtime(this.regtime);
        return appointment;
    }
}