package com.spring.bioMedical.service;

import com.nulabinc.zxcvbn.Zxcvbn;

/** Password strength check shared by sign-up, staff onboarding and password reset. */
public final class PasswordStrength {

	public static final String TOO_WEAK_MESSAGE = "Your password is too weak.  Choose a stronger one.";

	/** zxcvbn score from 0 (guessable) to 4 (very strong); 3 or more is accepted. */
	private static final int MIN_SCORE = 3;

	private static final Zxcvbn ZXCVBN = new Zxcvbn();

	private PasswordStrength() {
	}

	public static boolean isTooWeak(String password) {
		return password == null || ZXCVBN.measure(password).getScore() < MIN_SCORE;
	}
}
