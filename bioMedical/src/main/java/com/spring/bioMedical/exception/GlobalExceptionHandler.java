package com.spring.bioMedical.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Turns errors into plain-text responses, the same format the existing endpoints already use,
 * so the frontend can show {@code error.response.data} directly.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

	private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

	@ExceptionHandler(ApiException.class)
	public ResponseEntity<String> handleApi(ApiException e) {
		return ResponseEntity.status(e.getStatus()).body(e.getMessage());
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<String> handleValidation(MethodArgumentNotValidException e) {
		String message = e.getBindingResult().getFieldErrors().stream()
				.map(error -> error.getDefaultMessage())
				.findFirst()
				.orElse("Invalid request");
		return ResponseEntity.badRequest().body(message);
	}

	@ExceptionHandler(HttpMessageNotReadableException.class)
	public ResponseEntity<String> handleUnreadable(HttpMessageNotReadableException e) {
		return ResponseEntity.badRequest().body("Malformed request");
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<String> handleUnexpected(Exception e) throws Exception {
		// Let Spring Security turn access errors into 401/403 as usual.
		if (e instanceof org.springframework.security.access.AccessDeniedException
				|| e instanceof org.springframework.security.core.AuthenticationException) {
			throw e;
		}
		logger.error("Unexpected error", e);
		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Something went wrong. Please try again.");
	}
}
