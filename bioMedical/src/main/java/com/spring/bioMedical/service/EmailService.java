package com.spring.bioMedical.service;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

/**
 * Sends the app's e-mails, in this order of preference:
 * <ol>
 * <li>Brevo's HTTPS API when {@code BREVO_API_KEY} is set. Use this on hosts that block outgoing SMTP,
 * such as Render's free plan (ports 25, 465 and 587 are closed there).</li>
 * <li>SMTP (Gmail by default) when {@code MAIL_USERNAME} and {@code MAIL_PASSWORD} are set.</li>
 * <li>Otherwise the message is only logged, so local development works without any account.</li>
 * </ol>
 * Sending is asynchronous, so a slow or failing mail provider never delays a request.
 */
@Service("emailService")
public class EmailService {
	private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
	private static final String BREVO_URL = "https://api.brevo.com/v3/smtp/email";

	private final JavaMailSender mailSender;
	private final RestClient http;

	@Value("${app.mail.brevo-api-key:}")
	private String brevoApiKey;

	// The address e-mails come from; falls back to the SMTP login
	@Value("${app.mail.from:${spring.mail.username:}}")
	private String fromAddress;

	@Value("${app.mail.from-name:E-Medical}")
	private String fromName;

	@Value("${spring.mail.username:}")
	private String smtpUsername;

	// Spring only creates a JavaMailSender when spring.mail.host is set, so it is optional here
	@Autowired
	public EmailService(ObjectProvider<JavaMailSender> mailSender, RestClient.Builder http) {
		this.mailSender = mailSender.getIfAvailable();
		this.http = http.build();
	}

	/** Which way e-mails will leave, for the startup log and health checks. */
	public String mode() {
		if (!isBlank(brevoApiKey)) {
			return "brevo";
		}
		if (mailSender != null && !isBlank(smtpUsername)) {
			return "smtp";
		}
		return "log-only";
	}

	@Async
	public void sendEmail(SimpleMailMessage email) {
		switch (mode()) {
			case "brevo" -> sendWithBrevo(email);
			case "smtp" -> sendWithSmtp(email);
			default -> logger.warn("E-mail is not configured (set BREVO_API_KEY, or MAIL_USERNAME and MAIL_PASSWORD). "
					+ "Message to {} not sent:\n{}", (Object) email.getTo(), email.getText());
		}
	}

	private void sendWithBrevo(SimpleMailMessage email) {
		List<Map<String, String>> to = Arrays.stream(email.getTo()).map(address -> Map.of("email", address)).toList();
		Map<String, Object> body = Map.of(
				"sender", Map.of("email", fromAddress, "name", fromName),
				"to", to,
				"subject", email.getSubject() == null ? "" : email.getSubject(),
				"textContent", email.getText() == null ? "" : email.getText());
		try {
			http.post().uri(BREVO_URL)
					.header("api-key", brevoApiKey)
					.contentType(MediaType.APPLICATION_JSON)
					.accept(MediaType.APPLICATION_JSON)
					.body(body)
					.retrieve()
					.toBodilessEntity();
			logger.info("Email sent via Brevo to: {}", (Object) email.getTo());
		} catch (RestClientException e) {
			logger.error("Failed to send email via Brevo to: {}: {}", email.getTo(), e.getMessage());
		}
	}

	private void sendWithSmtp(SimpleMailMessage email) {
		email.setFrom(isBlank(fromAddress) ? smtpUsername : fromAddress);
		try {
			mailSender.send(email);
			logger.info("Email sent via SMTP to: {}", (Object) email.getTo());
		} catch (MailException e) {
			logger.error("Failed to send email via SMTP to: {}", email.getTo(), e);
		}
	}

	private static boolean isBlank(String s) {
		return s == null || s.isBlank();
	}
}
