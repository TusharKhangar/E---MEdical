package com.spring.bioMedical.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;



@Service("emailService")
public class EmailService {
	private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
	private final JavaMailSender mailSender;

	// The Gmail account the app sends from; blank when SMTP is not configured.
	@Value("${spring.mail.username:}")
	private String fromAddress;

	// Spring only creates a JavaMailSender when spring.mail.host is set, so it is optional here
	@Autowired
	public EmailService(ObjectProvider<JavaMailSender> mailSender) {
		this.mailSender = mailSender.getIfAvailable();
	}

	@Async
	public void sendEmail(SimpleMailMessage email) {
		if (mailSender == null || fromAddress == null || fromAddress.isBlank()) {
			// No SMTP account configured (local dev or a demo deploy): log the message so its link can still be used.
			logger.warn("E-mail is not configured (MAIL_USERNAME is empty). Message to {}:\n{}",
					(Object) email.getTo(), email.getText());
			return;
		}
		email.setFrom(fromAddress);
		try {
			mailSender.send(email);
			logger.info("Email sent successfully to: {}", (Object) email.getTo());
		} catch (MailException e) {
			logger.error("Failed to send email to: {}", email.getTo(), e);
		}
	}
}
