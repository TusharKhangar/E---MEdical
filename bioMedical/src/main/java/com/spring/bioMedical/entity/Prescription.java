package com.spring.bioMedical.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Embeddable;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** What the doctor recorded at the end of a visit: diagnosis, advice and the medicines prescribed. */
@Entity
@Getter
@Setter
@Table(name = "prescription")
public class Prescription {

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private Long id;

	@Column(name = "appointment_id", nullable = false, unique = true)
	private Long appointmentId;

	@Column(name = "diagnosis", nullable = false, length = 500)
	private String diagnosis;

	/** Advice for the patient: rest, diet, tests to take, when to come back. */
	@Column(name = "notes", length = 2000)
	private String notes;

	/** yyyy-MM-dd, optional. */
	@Column(name = "follow_up_date", length = 10)
	private String followUpDate;

	@ElementCollection(fetch = FetchType.EAGER)
	@CollectionTable(name = "prescription_medicine", joinColumns = @JoinColumn(name = "prescription_id"))
	@OrderColumn(name = "position")
	private List<Medicine> medicines = new ArrayList<>();

	@Column(name = "created_at", nullable = false)
	private LocalDateTime createdAt;

	@Column(name = "updated_at", nullable = false)
	private LocalDateTime updatedAt;

	@PrePersist
	void onCreate() {
		createdAt = LocalDateTime.now().withNano(0);
		updatedAt = createdAt;
	}

	@PreUpdate
	void onUpdate() {
		updatedAt = LocalDateTime.now().withNano(0);
	}

	/** One line of the prescription. */
	@Embeddable
	@Getter
	@Setter
	@NoArgsConstructor
	public static class Medicine {

		@Column(name = "name", nullable = false, length = 120)
		private String name;

		/** e.g. "500 mg" */
		@Column(name = "dosage", length = 60)
		private String dosage;

		/** e.g. "Twice a day after meals" */
		@Column(name = "frequency", length = 120)
		private String frequency;

		@Column(name = "duration_days")
		private Integer durationDays;
	}
}
