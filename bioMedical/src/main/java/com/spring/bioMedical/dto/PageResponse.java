package com.spring.bioMedical.dto;

import java.util.List;
import java.util.function.Function;

import org.springframework.data.domain.Page;

/** One page of results, with what the table needs to draw its pager. */
public record PageResponse<T>(List<T> content, int page, int size, long totalElements, int totalPages) {

	public static <E, T> PageResponse<T> of(Page<E> page, Function<E, T> mapper) {
		return new PageResponse<>(page.getContent().stream().map(mapper).toList(), page.getNumber(), page.getSize(),
				page.getTotalElements(), page.getTotalPages());
	}
}
