package com.spring.bioMedical.entity;

import  jakarta.persistence.Column;
import  jakarta.persistence.Entity;
import  jakarta.persistence.GeneratedValue;
import  jakarta.persistence.GenerationType;
import  jakarta.persistence.Id;
import  jakarta.persistence.Table;

import lombok.Data;

/**
 * A booking made by a patient with one doctor. {@code name} and {@code email} are the patient's.
 * Dates are stored as ISO strings ({@code yyyy-MM-dd}) and times as {@code HH:mm}.
 */
@Entity
@Data
@Table(name = "appointment")
public class Appointment {

	public static final String PENDING = "PENDING";
	public static final String CONFIRMED = "CONFIRMED";
	public static final String COMPLETED = "COMPLETED";
	public static final String CANCELLED = "CANCELLED";

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	@Column(name = "id")
	private Long id;

	// Not unique: a patient can have many appointments.
	@Column(name = "name", nullable = false)
	private String name;

	@Column(name = "email")
	private String email;

	@Column(name = "date")
	private String date;

	@Column(name = "time")
	private String time;

	@Column(name = "description")
	private String description;

	@Column(name = "regtime")
	private String regtime;

	@Column(name = "doctor_id")
	private Long doctorId;

	@Column(name = "doctor_name")
	private String doctorName;

	@Column(name = "department")
	private String department;

	// PENDING, CONFIRMED, COMPLETED or CANCELLED
	@Column(name = "status")
	private String status = PENDING;

	@Override
	public String toString() {
		return "Appointment [id=" + id + ", name=" + name + ", email=" + email + ", date=" + date + ", time=" + time
				+ ", doctorId=" + doctorId + ", status=" + status + ", description=" + description + "]";
	}

	/** Appointments that still hold their time slot. */
	public boolean isActive() {
		return status == null || PENDING.equals(status) || CONFIRMED.equals(status);
	}
}