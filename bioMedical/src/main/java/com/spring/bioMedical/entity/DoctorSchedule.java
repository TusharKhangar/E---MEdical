package com.spring.bioMedical.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * A doctor's working hours on one day of the week. Days without a row use the clinic default
 * (09:00 to 18:00), so doctors only need to save the days they change.
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "doctor_schedule", uniqueConstraints = @UniqueConstraint(columnNames = { "doctor_id", "day_of_week" }))
public class DoctorSchedule {

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private Long id;

	@Column(name = "doctor_id", nullable = false)
	private Long doctorId;

	/** ISO day of week: 1 = Monday ... 7 = Sunday. */
	@Column(name = "day_of_week", nullable = false)
	private int dayOfWeek;

	@Column(name = "working", nullable = false)
	private boolean working;

	/** First bookable hour, "HH:00". */
	@Column(name = "start_time", nullable = false, length = 5)
	private String startTime;

	/** End of the working day (exclusive), "HH:00". The last slot starts an hour earlier. */
	@Column(name = "end_time", nullable = false, length = 5)
	private String endTime;

	public DoctorSchedule(Long doctorId, int dayOfWeek, boolean working, String startTime, String endTime) {
		this.doctorId = doctorId;
		this.dayOfWeek = dayOfWeek;
		this.working = working;
		this.startTime = startTime;
		this.endTime = endTime;
	}
}
