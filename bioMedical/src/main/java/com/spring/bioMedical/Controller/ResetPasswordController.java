package com.spring.bioMedical.Controller;

import com.spring.bioMedical.entity.User;
import com.spring.bioMedical.repository.UserRepository;
import com.spring.bioMedical.service.EmailService;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class ResetPasswordController {
    private final UserRepository userRepository;
    private final EmailService emailService;

    ResetPasswordController(UserRepository userRepository, EmailService emailService){
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    @PostMapping("/forgotPassword")
    public ResponseEntity<String> forgotPassword(@RequestBody String email){
          Optional<User> user = userRepository.findByEmail(email);
         if(user.isPresent()){
            String token =(UUID.randomUUID().toString());
            user.get().setConfirmationToken(token);
            userRepository.save(user.get());
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setTo(email);
            mailMessage.setSubject("Reset Password");
            mailMessage.setText("Reset your password:\nhttp://localhost:5173/reset-password?token=" + token);
            mailMessage.setFrom("spring.email.auth@gmail.com");
            emailService.sendEmail(mailMessage);
             return ResponseEntity.ok("A reset link has been sent to the email" + token);
         }else{
             return ResponseEntity.ok("That user doesn't exist");
         }
    }

    @PutMapping("/resetPassword")
    public ResponseEntity<String> resetPassword(@RequestBody String email){
        Optional<User> user = userRepository.findByEmail(email);
        if(user.isPresent()){
            String token =(UUID.randomUUID().toString());
            user.get().setConfirmationToken(token);
            userRepository.save(user.get());
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setTo(email);
            mailMessage.setSubject("Reset Password");
            mailMessage.setText("Reset your password:\nhttp://localhost:5173/reset-password?token=" + token);
            mailMessage.setFrom("spring.email.auth@gmail.com");
            emailService.sendEmail(mailMessage);
            return ResponseEntity.ok("A reset link has been sent to the email");
        }
        return ResponseEntity.ok("IF that email exist reset link has been sent to the email");
    }
}
