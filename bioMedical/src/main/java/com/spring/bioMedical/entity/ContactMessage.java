package com.spring.bioMedical.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/** A message sent through the public Contact page, read by administrators. */
@Entity
@Getter
@Setter
@Table(name = "contact_message")
public class ContactMessage {

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private Long id;

	@Column(name = "name", nullable = false, length = 120)
	private String name;

	@Column(name = "email", nullable = false, length = 120)
	private String email;

	@Column(name = "subject", length = 60)
	private String subject;

	@Column(name = "message", nullable = false, length = 2000)
	private String message;

	@Column(name = "handled", nullable = false)
	private boolean handled;

	@Column(name = "created_at", nullable = false)
	private LocalDateTime createdAt;

	@PrePersist
	void onCreate() {
		if (createdAt == null) {
			createdAt = LocalDateTime.now().withNano(0);
		}
	}
}
