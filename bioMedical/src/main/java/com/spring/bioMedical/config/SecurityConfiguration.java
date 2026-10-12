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
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.spring.bioMedical.security.JwtFilter;

import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;

@Configuration
@EnableWebSecurity
public class SecurityConfiguration {

	private final JwtFilter jwtFilter;
	private final AuthEntryPointJwt authEntryPoint;

	// Browser origins allowed to call the API, from app.cors.allowed-origins
	@Value("${app.cors.allowed-origins:http://localhost:5173,http://localhost:3000}")
	private List<String> allowedOrigins;

	public SecurityConfiguration(JwtFilter jwtFilter, AuthEntryPointJwt authEntryPoint) {
		this.jwtFilter = jwtFilter;
		this.authEntryPoint = authEntryPoint;
	}

	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	@Bean
	public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
		return authConfig.getAuthenticationManager();
	}

	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration configuration = new CorsConfiguration();

		configuration.setAllowedOrigins(allowedOrigins);

		configuration.setAllowedMethods(Arrays.asList(
				"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"
		));

		configuration.setAllowedHeaders(Arrays.asList("*"));
		configuration.setAllowCredentials(true);
		configuration.setExposedHeaders(Arrays.asList("Authorization"));

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/api/**", configuration);
		return source;
	}

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		http
				// Enable CORS
				.cors(cors -> cors.configurationSource(corsConfigurationSource()))

				// Disable CSRF (not needed for REST APIs with JWT)
				.csrf(AbstractHttpConfigurer::disable)

				// Stateless session (JWT-based)
				.sessionManagement(session ->
						session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
				)

				// Configure API endpoint security
				.authorizeHttpRequests(auth -> auth
						// Public authentication endpoints
						.requestMatchers(
								"/api/register",
								"/api/login",
								"/api/confirm",
								"/api/confirmPassword",
                                "/api/forgotPassword",
                                "/api/resetPassword"
						).permitAll()

						// Public doctor directory and free slots
						.requestMatchers(HttpMethod.GET, "/api/doctors", "/api/doctors/**").permitAll()

						// Health check for Docker and the hosting platform
						.requestMatchers("/actuator/health", "/actuator/info").permitAll()

						// Spring's error page, so 400/404 responses are not turned into 403
						.requestMatchers("/error").permitAll()

						// Role-based API endpoints
						.requestMatchers("/api/admin/**").hasRole("ADMIN")
						.requestMatchers("/api/doctor/**").hasRole("DOCTOR")
						.requestMatchers("/api/user/**").hasRole("USER")

						// All other API requests require authentication
						.requestMatchers("/api/**", "/actuator/**").authenticated()

						// Everything else is the React app's static files, served from the same jar in Docker
						.anyRequest().permitAll()
				)

				// Missing or expired token: answer 401 (not 403) so the frontend sends the user to login
				.exceptionHandling(e -> e.authenticationEntryPoint(authEntryPoint))

				// Add JWT filter before username/password authentication
				.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

		return http.build();
	}
}
