package com.spring.bioMedical.config;

import java.io.IOException;
import java.util.UUID;
import java.util.regex.Pattern;

import org.slf4j.MDC;
import org.springframework.boot.actuate.autoconfigure.metrics.MeterRegistryCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.spring.bioMedical.entity.Appointment;
import com.spring.bioMedical.repository.AppointmentRepository;

import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.binder.MeterBinder;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Metrics for Prometheus (/actuator/prometheus) and a request id on every log line.
 * The app's own counters (bookings, logins, e-mails) are recorded where those things happen.
 */
@Configuration
public class ObservabilityConfig {

	/** Every metric carries application="e-medical", so one Prometheus can watch several apps. */
	@Bean
	public MeterRegistryCustomizer<MeterRegistry> applicationTag() {
		return registry -> registry.config().commonTags("application", "e-medical");
	}

	/** How many appointments are waiting for a doctor to confirm them (read when Prometheus scrapes). */
	@Bean
	public MeterBinder pendingAppointments(AppointmentRepository appointments) {
		return registry -> Gauge.builder("emedical.appointments.pending", appointments,
				repo -> repo.countByStatus(Appointment.PENDING))
				.description("Appointments waiting for the doctor to confirm")
				.register(registry);
	}

	/**
	 * Gives each request an id (the caller's X-Request-Id if it sent a sane one), puts it in the logs as
	 * requestId and sends it back in the response, so one user's problem can be found in the logs.
	 */
	@Component
	@Order(Ordered.HIGHEST_PRECEDENCE)
	public static class RequestIdFilter extends OncePerRequestFilter {

		static final String HEADER = "X-Request-Id";
		private static final Pattern SAFE = Pattern.compile("[A-Za-z0-9._-]{1,64}");

		@Override
		protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
				throws ServletException, IOException {
			String incoming = request.getHeader(HEADER);
			String id = incoming != null && SAFE.matcher(incoming).matches() ? incoming : UUID.randomUUID().toString();
			MDC.put("requestId", id);
			response.setHeader(HEADER, id);
			try {
				chain.doFilter(request, response);
			} finally {
				MDC.remove("requestId");
			}
		}
	}
}
