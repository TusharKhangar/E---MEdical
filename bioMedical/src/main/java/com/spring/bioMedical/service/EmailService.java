package com.spring.bioMedical.service;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import io.micrometer.core.instrument.Metrics;
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
import org.springframework.web.client.RestClientResponseException;

/**
 * Sends the app's e-mails, in this order of preference:
 * <ol>
 * <li>Brevo's HTTPS API when {@code BREVO_API_KEY} is set, or Mailjet's when {@code MAILJET_API_KEY} and
 * {@code MAILJET_SECRET_KEY} are set. Use one of these on hosts that block outgoing SMTP, such as Render's
 * free plan (ports 25, 465 and 587 are closed there).</li>
 * <li>SMTP (Gmail by default) when {@code MAIL_USERNAME} and {@code MAIL_PASSWORD} are set.</li>
 * <li>Otherwise the message is only logged, so local development works without any account.</li>
 * </ol>
 * Sending is asynchronous, so a slow or failing mail provider never delays a request.
 */
@Service("emailService")
public class EmailService {
	private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
	private static final String BREVO_URL = "https://api.brevo.com/v3/smtp/email";
	private static final String MAILJET_URL = "https://api.mailjet.com/v3.1/send";

	private final JavaMailSender mailSender;
	private final RestClient http;

	@Value("${app.mail.brevo-api-key:}")
	private String brevoApiKey;

	@Value("${app.mail.mailjet-api-key:}")
	private String mailjetApiKey;

	@Value("${app.mail.mailjet-secret-key:}")
	private String mailjetSecretKey;

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
		if (!isBlank(mailjetApiKey) && !isBlank(mailjetSecretKey)) {
			return "mailjet";
		}
		if (mailSender != null && !isBlank(smtpUsername)) {
			return "smtp";
		}
		return "log-only";
	}

	/** A sentence for the admin dashboard: where e-mail goes and from which address. */
	public String describe() {
		return switch (mode()) {
			case "brevo" -> "Brevo (HTTPS API), sending as " + fromAddress;
			case "mailjet" -> "Mailjet (HTTPS API), sending as " + fromAddress;
			case "smtp" -> "SMTP, sending as " + (isBlank(fromAddress) ? smtpUsername : fromAddress);
			default -> "Not configured: e-mails are only written to the server log";
		};
	}

	@Async
	public void sendEmail(SimpleMailMessage email) {
		Optional<String> error = sendNow(email);
		// In log-only mode sendNow has already logged the whole message, link included
		if (error.isPresent() && !"log-only".equals(mode())) {
			logger.error("E-mail to {} not sent: {}", (Object) email.getTo(), error.get());
		}
	}

	/**
	 * Sends on the calling thread and says what went wrong, if anything (empty means sent). Used by the
	 * admin's "send me a test e-mail" button, which needs the answer straight away.
	 */
	public Optional<String> sendNow(SimpleMailMessage email) {
		String provider = mode();
		Optional<String> error = send(provider, email);
		// Metric emedical_emails_total{provider, result}: shows a provider starting to refuse mail
		Metrics.counter("emedical.emails", "provider", provider, "result", error.isEmpty() ? "sent" : "failed").increment();
		return error;
	}

	private Optional<String> send(String provider, SimpleMailMessage email) {
		return switch (provider) {
			case "brevo" -> sendWithBrevo(email);
			case "mailjet" -> sendWithMailjet(email);
			case "smtp" -> sendWithSmtp(email);
			default -> {
				logger.warn("E-mail is not configured (set BREVO_API_KEY, or MAIL_USERNAME and MAIL_PASSWORD). "
						+ "Message to {} not sent:\n{}", (Object) email.getTo(), email.getText());
				yield Optional.of("E-mail is not configured. Set MAILJET_API_KEY and MAILJET_SECRET_KEY (or BREVO_API_KEY) with MAIL_FROM, or MAIL_USERNAME and MAIL_PASSWORD.");
			}
		};
	}

	private Optional<String> sendWithBrevo(SimpleMailMessage email) {
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
			return Optional.empty();
		} catch (RestClientResponseException e) {
			// Brevo answers with a JSON body that says why (bad key, unverified sender, ...)
			return Optional.of("Brevo refused the message (" + e.getStatusCode().value() + "): " + e.getResponseBodyAsString());
		} catch (RestClientException e) {
			return Optional.of("Could not reach Brevo: " + e.getMessage());
		}
	}

	private Optional<String> sendWithMailjet(SimpleMailMessage email) {
		List<Map<String, String>> to = Arrays.stream(email.getTo()).map(address -> Map.of("Email", address)).toList();
		Map<String, Object> message = Map.of(
				"From", Map.of("Email", fromAddress, "Name", fromName),
				"To", to,
				"Subject", email.getSubject() == null ? "" : email.getSubject(),
				"TextPart", email.getText() == null ? "" : email.getText());
		try {
			http.post().uri(MAILJET_URL)
					.headers(h -> h.setBasicAuth(mailjetApiKey, mailjetSecretKey))
					.contentType(MediaType.APPLICATION_JSON)
					.accept(MediaType.APPLICATION_JSON)
					.body(Map.of("Messages", List.of(message)))
					.retrieve()
					.toBodilessEntity();
			logger.info("Email sent via Mailjet to: {}", (Object) email.getTo());
			return Optional.empty();
		} catch (RestClientResponseException e) {
			return Optional.of("Mailjet refused the message (" + e.getStatusCode().value() + "): " + e.getResponseBodyAsString());
		} catch (RestClientException e) {
			return Optional.of("Could not reach Mailjet: " + e.getMessage());
		}
	}

	private Optional<String> sendWithSmtp(SimpleMailMessage email) {
		email.setFrom(isBlank(fromAddress) ? smtpUsername : fromAddress);
		try {
			mailSender.send(email);
			logger.info("Email sent via SMTP to: {}", (Object) email.getTo());
			return Optional.empty();
		} catch (MailException e) {
			return Optional.of("The SMTP server refused the message: " + e.getMessage());
		}
	}

	private static boolean isBlank(String s) {
		return s == null || s.isBlank();
	}
}
