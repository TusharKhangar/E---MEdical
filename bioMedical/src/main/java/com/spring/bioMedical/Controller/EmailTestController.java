package com.spring.bioMedical.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/test")
public class EmailTestController {

    @Autowired
    private JavaMailSender mailSender;

    @GetMapping("/send-email")
    public String sendEmail() {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo("csgeek66@gmail.com"); // Replace with your email
            message.setSubject("Test Email");
            message.setText("This is a test email from Spring Boot.");
            mailSender.send(message);
            return "Email sent successfully!";
        } catch (Exception e) {
            return "Error sending email: " + e.getMessage();
        }
    }
}
