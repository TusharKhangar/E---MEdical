package com.spring.bioMedical.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;

/** A day a doctor takes off: no slots are offered and no bookings are accepted. */
@Entity
@Getter
@Setter
@Table(name = "doctor_leave", uniqueConstraints = @UniqueConstraint(columnNames = { "doctor_id", "leave_date" }))
public class DoctorLeave {

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private Long id;

	@Column(name = "doctor_id", nullable = false)
	private Long doctorId;

	/** yyyy-MM-dd, same format as appointment dates. */
	@Column(name = "leave_date", nullable = false, length = 10)
	private String date;

	@Column(name = "reason", length = 120)
	private String reason;
}
