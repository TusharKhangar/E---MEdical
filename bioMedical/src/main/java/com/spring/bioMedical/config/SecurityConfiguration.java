package com.spring.bioMedical.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import com.spring.bioMedical.security.JwtFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfiguration {

	private final JwtFilter jwtFilter; // Inject your JWT filter

	public SecurityConfiguration(JwtFilter jwtFilter) {
		this.jwtFilter = jwtFilter;
	}

	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	@Bean
	public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
		return authenticationConfiguration.getAuthenticationManager();
	}

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		http
				.csrf(AbstractHttpConfigurer::disable)
				.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
				.authorizeHttpRequests(auth -> auth
						.requestMatchers("/api/register","/api/login","/confirm","/api/confirm").permitAll()
						.requestMatchers("/api/admin/**").hasRole("ADMIN")
						.requestMatchers("/api/user/**").hasRole("USER")
						.requestMatchers("/register", "/confirm", "/login/**", "/css/**", "/js/**", "/static/**", "/vendor/**", "/resources/**", "/test/send-email").permitAll()
						.anyRequest().authenticated()
				)
				.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

		return http.build();
	}

	@Bean
	public WebMvcConfigurer corsConfigurer() {
		return new WebMvcConfigurer() {
			@Override
			public void addCorsMappings(CorsRegistry registry) {
				registry.addMapping("/api/**")
						.allowedOrigins("http://localhost:3000")
						.allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
						.allowedHeaders("*")
						.allowCredentials(true);
			}
		};
	}
}