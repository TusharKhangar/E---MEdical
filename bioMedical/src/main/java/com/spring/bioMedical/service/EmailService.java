package com.spring.bioMedical.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;



@Service("emailService")
public class EmailService {
	private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
	private final JavaMailSender mailSender;
	
	@Autowired
	public EmailService(JavaMailSender mailSender) {
		this.mailSender = mailSender;
	}
	
	@Async
	public void sendEmail(SimpleMailMessage email) {
		try {
			mailSender.send(email);
			logger.info("Email sent successfully to: {}", (Object) email.getTo());
		} catch (MailException e) {
			logger.error("Failed to send email to: {}", email.getTo(), e);
		}
	}
}
