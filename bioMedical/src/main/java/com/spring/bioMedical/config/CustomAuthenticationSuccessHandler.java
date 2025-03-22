package com.spring.bioMedical.config;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.spring.bioMedical.security.JwtUtil;

@Configuration
public class CustomAuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private ObjectMapper objectMapper;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse, Authentication authentication) throws IOException, ServletException {

        Set<String> roles = AuthorityUtils.authorityListToSet(authentication.getAuthorities());
        String username = authentication.getName();

        String token = jwtUtil.generateToken(username);

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("username", username);
        response.put("roles", roles);

        httpServletResponse.setContentType("application/json");
        httpServletResponse.getWriter().write(objectMapper.writeValueAsString(response));
        httpServletResponse.getWriter().flush();
    }
}