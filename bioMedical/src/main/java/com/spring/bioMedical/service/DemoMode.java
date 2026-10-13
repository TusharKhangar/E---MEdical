package com.spring.bioMedical.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Demo mode is for public showcase deployments without a mail account: links that would normally only
 * arrive by e-mail are also returned in the API response. Never enable it where accounts are real.
 */
@Component
public class DemoMode {

	private final boolean enabled;

	public DemoMode(@Value("${app.demo-mode:false}") boolean enabled) {
		this.enabled = enabled;
	}

	public boolean isEnabled() {
		return enabled;
	}

	/** The link itself in demo mode, otherwise null so it stays out of the response. */
	public String expose(String link) {
		return enabled ? link : null;
	}

	/**
	 * The shared demo accounts (…@emedical.demo) can't have their password changed or be disabled in demo
	 * mode, so one visitor can't lock everyone else out of the showcase.
	 */
	public boolean isProtectedAccount(String email) {
		return enabled && email != null && email.toLowerCase().endsWith("@emedical.demo");
	}
}
