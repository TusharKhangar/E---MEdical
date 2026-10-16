package com.spring.bioMedical.entity;

import  jakarta.persistence.Column;
import  jakarta.persistence.Entity;
import  jakarta.persistence.GeneratedValue;
import  jakarta.persistence.GenerationType;
import  jakarta.persistence.Id;
import  jakarta.persistence.Index;
import  jakarta.persistence.Table;

import lombok.Data;

/**
 * A booking made by a patient with one doctor. {@code name} and {@code email} are the patient's.
 * Dates are stored as ISO strings ({@code yyyy-MM-dd}) and times as {@code HH:mm}.
 */
@Entity
@Data
// Indexes for the busiest queries (see docs/PERFORMANCE.md): a doctor's day and list, a patient's list,
// date ranges for analytics, and the admin's status filter.
@Table(name = "appointment", indexes = {
		@Index(name = "idx_appointment_doctor_date", columnList = "doctor_id, date, time"),
		@Index(name = "idx_appointment_email_date", columnList = "email, date"),
		@Index(name = "idx_appointment_date", columnList = "date"),
		@Index(name = "idx_appointment_status_date", columnList = "status, date") })
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

	// Set once the doctor saves a prescription, so lists can show it without an extra query per row
	@Column(name = "has_prescription")
	private Boolean hasPrescription;

	// Set when the day-before reminder e-mail has gone out, so it is never sent twice
	@Column(name = "reminder_sent")
	private Boolean reminderSent;

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