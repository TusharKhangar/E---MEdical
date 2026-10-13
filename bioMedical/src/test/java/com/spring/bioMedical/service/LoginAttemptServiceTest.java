package com.spring.bioMedical.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;

import org.junit.jupiter.api.Test;

class LoginAttemptServiceTest {

	/** A clock the test can move forward. */
	private static final class MutableClock extends Clock {
		private Instant now = Instant.parse("2026-01-01T10:00:00Z");

		void advance(Duration d) {
			now = now.plus(d);
		}

		@Override
		public Instant instant() {
			return now;
		}

		@Override
		public java.time.ZoneId getZone() {
			return ZoneOffset.UTC;
		}

		@Override
		public Clock withZone(java.time.ZoneId zone) {
			return this;
		}
	}

	private final MutableClock clock = new MutableClock();
	private final LoginAttemptService service = new LoginAttemptService(3, Duration.ofMinutes(15), clock);

	@Test
	void locksAfterTheLimitAndUnlocksWhenTheWindowPasses() {
		service.recordFailure("a@test.com");
		service.recordFailure("A@Test.com ");
		assertThat(service.minutesLocked("a@test.com")).isZero();

		service.recordFailure("a@test.com");
		assertThat(service.minutesLocked("a@test.com")).isEqualTo(15);

		clock.advance(Duration.ofMinutes(10));
		assertThat(service.minutesLocked("a@test.com")).isEqualTo(5);

		clock.advance(Duration.ofMinutes(6));
		assertThat(service.minutesLocked("a@test.com")).isZero();
	}

	@Test
	void successClearsFailuresAndAccountsAreIndependent() {
		service.recordFailure("a@test.com");
		service.recordFailure("a@test.com");
		service.recordSuccess("a@test.com");
		service.recordFailure("a@test.com");
		assertThat(service.minutesLocked("a@test.com")).isZero();

		for (int i = 0; i < 3; i++) {
			service.recordFailure("b@test.com");
		}
		assertThat(service.minutesLocked("b@test.com")).isPositive();
		assertThat(service.minutesLocked("a@test.com")).isZero();
	}
}
