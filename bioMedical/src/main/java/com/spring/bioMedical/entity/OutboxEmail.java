package com.spring.bioMedical.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * An e-mail waiting to be sent (transactional outbox). It is saved in the same transaction as the change that
 * caused it, so a booking can never commit without its e-mail, and no e-mail goes out for a change that rolled
 * back. {@code OutboxWorker} sends it afterwards and retries with growing delays if the provider fails.
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "email_outbox", indexes = @Index(name = "idx_outbox_status_next", columnList = "status, next_attempt_at"))
public class OutboxEmail {

	public static final String PENDING = "PENDING";
	/** Claimed by a worker that is sending it right now. */
	public static final String SENDING = "SENDING";
	public static final String SENT = "SENT";
	/** Gave up after the last retry. */
	public static final String FAILED = "FAILED";
	/** No provider configured: written to the log instead. */
	public static final String LOGGED = "LOGGED";

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private Long id;

	/** Comma-separated addresses. */
	@Column(name = "recipients", nullable = false, length = 500)
	private String recipients;

	@Column(name = "subject", length = 200)
	private String subject;

	@Column(name = "body", length = 8000)
	private String body;

	@Column(name = "status", nullable = false, length = 10)
	private String status = PENDING;

	@Column(name = "attempts", nullable = false)
	private int attempts;

	@Column(name = "created_at", nullable = false)
	private LocalDateTime createdAt;

	@Column(name = "next_attempt_at", nullable = false)
	private LocalDateTime nextAttemptAt;

	@Column(name = "claimed_at")
	private LocalDateTime claimedAt;

	@Column(name = "sent_at")
	private LocalDateTime sentAt;

	@Column(name = "last_error", length = 500)
	private String lastError;
}
