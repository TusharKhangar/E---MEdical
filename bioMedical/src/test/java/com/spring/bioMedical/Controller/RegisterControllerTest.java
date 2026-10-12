package com.spring.bioMedical.Controller;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.spring.bioMedical.config.AuthEntryPointJwt;
import com.spring.bioMedical.config.SecurityConfiguration;
import com.spring.bioMedical.dto.ConfirmationRequest;
import com.spring.bioMedical.dto.RegistrationRequest;
import com.spring.bioMedical.entity.User;
import com.spring.bioMedical.security.JwtFilter;
import com.spring.bioMedical.security.JwtUtil;
import com.spring.bioMedical.service.EmailService;
import com.spring.bioMedical.service.UserService;

/** Web-layer tests for sign-up and e-mail confirmation, using the real security rules. */
@WebMvcTest(RegisterController.class)
@Import({ SecurityConfiguration.class, JwtFilter.class, AuthEntryPointJwt.class })
@AutoConfigureMockMvc
public class RegisterControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;

    @MockBean
    private EmailService emailService;

    @MockBean
    private JwtUtil jwtUtil;

    @MockBean
    private org.springframework.security.core.userdetails.UserDetailsService userDetailsService;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private RegistrationRequest validRegistration;
    private User validUser;
    private ConfirmationRequest validConfirmation;

    @BeforeEach
    void setUp() {
        validRegistration = new RegistrationRequest();
        validRegistration.setEmail("test@example.com");
        validRegistration.setFirstName("Test");
        validRegistration.setLastName("User");
        validRegistration.setPhoneNumber("9876543210");
        validRegistration.setGender("MALE");

        validUser = new User();
        validUser.setEmail("test@example.com");
        validUser.setFirstName("Test");
        validUser.setLastName("User");
        validUser.setConfirmationToken("test-token-123");
        validUser.setEnabled(false);
        validUser.setRole("ROLE_USER");

        validConfirmation = new ConfirmationRequest();
        validConfirmation.setToken("test-token-123");
        validConfirmation.setPassword("StrongP@ssw0rd123");
    }

    @Test
    void registerUser_WithNewEmail_ShouldReturnSuccess() throws Exception {
        when(userService.findByEmail(anyString())).thenReturn(Optional.empty());

        mockMvc.perform(post("/api/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRegistration)))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("confirmation e-mail has been sent")));

        verify(userService).saveUser(argThat(u -> !u.getEnabled() && "ROLE_USER".equals(u.getRole())
                && u.getConfirmationToken() != null && u.getPassword() == null));
        verify(emailService).sendEmail(argThat((SimpleMailMessage m) ->
                m.getText().contains("http://localhost:5173/confirm?token=")));
    }

    @Test
    void registerUser_WithExistingEmail_ShouldReturnConflict() throws Exception {
        when(userService.findByEmail(anyString())).thenReturn(Optional.of(validUser));

        mockMvc.perform(post("/api/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRegistration)))
                .andExpect(status().isConflict())
                .andExpect(content().string(containsString("already a user registered")));

        verify(userService, never()).saveUser(any(User.class));
        verify(emailService, never()).sendEmail(any(SimpleMailMessage.class));
    }

    @Test
    void registerUser_WithInvalidEmail_ShouldReturnBadRequest() throws Exception {
        validRegistration.setEmail("invalid-email");

        mockMvc.perform(post("/api/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRegistration)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(containsString("valid e-mail")));

        verify(userService, never()).saveUser(any(User.class));
    }

    @Test
    void registerUser_WithBadPhoneNumber_ShouldReturnBadRequest() throws Exception {
        validRegistration.setPhoneNumber("12345");

        mockMvc.perform(post("/api/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRegistration)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(containsString("10-digit phone number")));
    }

    @Test
    void confirmRegistration_WithValidToken_ShouldReturnToken() throws Exception {
        when(userService.findByConfirmationToken("test-token-123")).thenReturn(Optional.of(validUser));

        mockMvc.perform(get("/api/confirm").param("token", "test-token-123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("test-token-123"));
    }

    @Test
    void confirmRegistration_WithInvalidToken_ShouldReturnBadRequest() throws Exception {
        when(userService.findByConfirmationToken("invalid-token")).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/confirm").param("token", "invalid-token"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(containsString("invalid confirmation link")));
    }

    @Test
    void confirmPassword_WithValidTokenAndStrongPassword_ShouldEnableUserAndClearToken() throws Exception {
        when(userService.findByConfirmationToken("test-token-123")).thenReturn(Optional.of(validUser));

        mockMvc.perform(post("/api/confirmPassword")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validConfirmation)))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("password has been set")));

        verify(userService).saveUser(argThat(u -> u.getEnabled() && u.getConfirmationToken() == null
                && passwordEncoder.matches("StrongP@ssw0rd123", u.getPassword())));
    }

    @Test
    void confirmPassword_WithWeakPassword_ShouldReturnBadRequest() throws Exception {
        validConfirmation.setPassword("weak");

        mockMvc.perform(post("/api/confirmPassword")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validConfirmation)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(containsString("password is too weak")));

        verify(userService, never()).saveUser(any(User.class));
    }

    @Test
    void confirmPassword_WithUnknownToken_ShouldReturnBadRequest() throws Exception {
        when(userService.findByConfirmationToken("test-token-123")).thenReturn(Optional.empty());

        mockMvc.perform(post("/api/confirmPassword")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validConfirmation)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(containsString("Invalid confirmation token")));

        verify(userService, never()).saveUser(any(User.class));
    }

}
