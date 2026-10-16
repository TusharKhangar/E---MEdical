package com.spring.bioMedical.service;

import java.time.LocalDateTime;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.spring.bioMedical.entity.AuditEvent;
import com.spring.bioMedical.entity.User;
import com.spring.bioMedical.repository.AuditEventRepository;

/** Records administrator actions in the audit log, in the caller's transaction. */
@Service
public class AuditService {

	private static final Logger logger = LoggerFactory.getLogger(AuditService.class);

	private final AuditEventRepository events;

	public AuditService(AuditEventRepository events) {
		this.events = events;
	}

	public void record(String action, String target, String details) {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		String actor = auth == null ? "system" : auth.getName();
		AuditEvent event = new AuditEvent(LocalDateTime.now().withNano(0).toString(), actor, action,
				truncate(target, 200), truncate(details, 500), MDC.get("requestId"));
		events.save(event);
		logger.info("AUDIT {} by {} on {}{}", action, actor, event.getTarget(), details == null ? "" : " (" + details + ")");
	}

	/** "doctor Meera Iyer <meera@clinic.in> #12": still readable after the account is deleted. */
	public static String describe(User user) {
		String name = ((user.getFirstName() == null ? "" : user.getFirstName()) + " "
				+ (user.getLastName() == null ? "" : user.getLastName())).trim();
		String role = user.getRole() == null ? "" : user.getRole().replace("ROLE_", "").toLowerCase() + " ";
		return role + (name.isEmpty() ? "" : name + " ") + "<" + user.getEmail() + "> #" + user.getId();
	}

	private static String truncate(String s, int max) {
		return s == null || s.length() <= max ? s : s.substring(0, max);
	}
}
