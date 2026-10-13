package com.spring.bioMedical.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * A success message for flows that e-mail a link. {@code link} is only filled in demo mode
 * ({@code DEMO_MODE=true}), so people trying the hosted demo can continue without an inbox.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record LinkResponse(String message, String link) {
}
