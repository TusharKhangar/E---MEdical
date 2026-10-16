package com.spring.bioMedical.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;

import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * One thing an administrator did (who, what, to whom, when). Written in the same transaction as the change
 * and never edited or deleted by the app: there is no endpoint for either.
 */
@Entity
@Getter
@NoArgsConstructor
@Table(name = "audit_event", indexes = {
		@Index(name = "idx_audit_action", columnList = "action"),
		@Index(name = "idx_audit_actor", columnList = "actor") })
public class AuditEvent {

	public static final String ACCOUNT_ENABLED = "ACCOUNT_ENABLED";
	public static final String ACCOUNT_DISABLED = "ACCOUNT_DISABLED";
	public static final String ACCOUNT_DELETED = "ACCOUNT_DELETED";
	public static final String DOCTOR_INVITED = "DOCTOR_INVITED";
	public static final String ADMIN_INVITED = "ADMIN_INVITED";
	public static final String APPOINTMENT_STATUS_CHANGED = "APPOINTMENT_STATUS_CHANGED";

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private Long id;

	/** ISO date-time, like the other timestamps in this schema. */
	@Column(name = "at", nullable = false, length = 19)
	private String at;

	/** E-mail of the signed-in administrator. */
	@Column(name = "actor", nullable = false, length = 120)
	private String actor;

	@Column(name = "action", nullable = false, length = 40)
	private String action;

	/** Who or what it was done to, readable on its own (the account may be deleted later). */
	@Column(name = "target", nullable = false, length = 200)
	private String target;

	@Column(name = "details", length = 500)
	private String details;

	/** Same id as the X-Request-Id header and the log lines of that request. */
	@Column(name = "request_id", length = 64)
	private String requestId;

	public AuditEvent(String at, String actor, String action, String target, String details, String requestId) {
		this.at = at;
		this.actor = actor;
		this.action = action;
		this.target = target;
		this.details = details;
		this.requestId = requestId;
	}
}
