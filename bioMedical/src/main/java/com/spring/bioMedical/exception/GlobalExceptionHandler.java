package com.spring.bioMedical.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.NoHandlerFoundException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import jakarta.validation.ConstraintViolationException;
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

	/** Validation on entities at save time (e.g. a blank name that slipped past the request checks). */
	@ExceptionHandler(ConstraintViolationException.class)
	public ResponseEntity<String> handleConstraint(ConstraintViolationException e) {
		String message = e.getConstraintViolations().stream()
				.map(v -> v.getMessage())
				.findFirst()
				.orElse("Invalid request");
		return ResponseEntity.badRequest().body(message);
	}

	@ExceptionHandler({ MissingServletRequestParameterException.class, MethodArgumentTypeMismatchException.class })
	public ResponseEntity<String> handleBadParameter(Exception e) {
		return ResponseEntity.badRequest().body("Malformed request");
	}

	/** Unknown URL under /api: a 404, not a 500. */
	@ExceptionHandler({ NoResourceFoundException.class, NoHandlerFoundException.class })
	public ResponseEntity<String> handleNotFound(Exception e) {
		return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Not found");
	}

	@ExceptionHandler(HttpRequestMethodNotSupportedException.class)
	public ResponseEntity<String> handleMethod(HttpRequestMethodNotSupportedException e) {
		return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).body("Method not allowed");
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
