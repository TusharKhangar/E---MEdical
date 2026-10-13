package com.spring.bioMedical.service;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Brute-force protection for sign-in: after {@code app.login.max-failures} wrong passwords for the
 * same e-mail within the lock window, further attempts are refused until the window passes.
 * State is kept in memory, which is enough for a single instance.
 */
@Service
public class LoginAttemptService {

	private record Failures(int count, Instant firstFailure) {
	}

	private final Map<String, Failures> failures = new ConcurrentHashMap<>();
	private final int maxFailures;
	private final Duration lockWindow;
	private final Clock clock;

	@Autowired
	public LoginAttemptService(@Value("${app.login.max-failures:5}") int maxFailures,
			@Value("${app.login.lock-minutes:15}") long lockMinutes) {
		this(maxFailures, Duration.ofMinutes(lockMinutes), Clock.systemUTC());
	}

	LoginAttemptService(int maxFailures, Duration lockWindow, Clock clock) {
		this.maxFailures = maxFailures;
		this.lockWindow = lockWindow;
		this.clock = clock;
	}

	/** Minutes left on the lock, or 0 if this e-mail may try to sign in. */
	public long minutesLocked(String email) {
		Failures f = current(email);
		if (f == null || f.count() < maxFailures) {
			return 0;
		}
		Duration left = Duration.between(clock.instant(), f.firstFailure().plus(lockWindow));
		return Math.max(1, (left.toSeconds() + 59) / 60);
	}

	public void recordFailure(String email) {
		failures.compute(key(email), (k, f) -> {
			Instant now = clock.instant();
			if (f == null || expired(f, now)) {
				return new Failures(1, now);
			}
			return new Failures(f.count() + 1, f.firstFailure());
		});
	}

	public void recordSuccess(String email) {
		failures.remove(key(email));
	}

	private Failures current(String email) {
		Failures f = failures.get(key(email));
		if (f != null && expired(f, clock.instant())) {
			failures.remove(key(email), f);
			return null;
		}
		return f;
	}

	private boolean expired(Failures f, Instant now) {
		return now.isAfter(f.firstFailure().plus(lockWindow));
	}

	private static String key(String email) {
		return email.trim().toLowerCase(Locale.ROOT);
	}
}
