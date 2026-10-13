package com.spring.bioMedical.Controller;

import com.spring.bioMedical.dto.ConfirmationRequest;
import com.spring.bioMedical.entity.User;
import com.spring.bioMedical.repository.UserRepository;
import com.spring.bioMedical.service.DemoMode;
import com.spring.bioMedical.service.EmailService;
import com.spring.bioMedical.service.PasswordStrength;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.Optional;
import java.util.UUID;

/**
 * Forgotten password: {@code /forgotPassword} e-mails a one-time link, and {@code /resetPassword}
 * sets the new password from that link.
 */
@RestController
@Tag(name = "Authentication")
@RequestMapping("/api")
public class ResetPasswordController {

    // Same reply whether or not the account exists, so the form cannot be used to discover e-mails.
    static final String RESET_SENT = "If that email exists, a reset link has been sent to it.";

    private final UserRepository userRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final DemoMode demoMode;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    ResetPasswordController(UserRepository userRepository, EmailService emailService, PasswordEncoder passwordEncoder,
            DemoMode demoMode){
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
        this.demoMode = demoMode;
    }

    /** Body is the e-mail address as plain text (the frontend sends {@code text/plain}). */
    @PostMapping("/forgotPassword")
    public ResponseEntity<String> forgotPassword(@RequestBody String email){
        String address = email.trim().replace("\"", "").toLowerCase();
        Optional<User> user = userRepository.findByEmail(address);
        if (user.isPresent() && !demoMode.isProtectedAccount(address)) {
            String token = UUID.randomUUID().toString();
            user.get().setConfirmationToken(token);
            userRepository.save(user.get());
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setTo(address);
            mailMessage.setSubject("Reset Password");
            mailMessage.setText("Reset your password:\n" + frontendUrl + "/reset-password?token=" + token);
            emailService.sendEmail(mailMessage);
        }
        return ResponseEntity.ok(RESET_SENT);
    }

    /** Body: {"token": "...", "password": "..."} from the reset link. */
    @PostMapping("/resetPassword")
    public ResponseEntity<String> resetPassword(@Valid @RequestBody ConfirmationRequest request, BindingResult bindingResult){
        if (bindingResult.hasErrors()) {
            return ResponseEntity.badRequest().body(bindingResult.getFieldErrors().get(0).getDefaultMessage());
        }
        if (PasswordStrength.isTooWeak(request.getPassword())) {
            return ResponseEntity.badRequest().body(PasswordStrength.TOO_WEAK_MESSAGE);
        }
        Optional<User> user = userRepository.findByConfirmationToken(request.getToken());
        if (user.isEmpty()) {
            return ResponseEntity.badRequest().body("This reset link is invalid or has already been used.");
        }
        user.get().setPassword(passwordEncoder.encode(request.getPassword()));
        user.get().setEnabled(true);
        user.get().setConfirmationToken(null);
        userRepository.save(user.get());
        return ResponseEntity.ok("Your password has been reset. You can now log in.");
    }
}
