package com.spring.bioMedical.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.spring.bioMedical.entity.ContactMessage;

public interface ContactMessageRepository extends JpaRepository<ContactMessage, Long> {

	List<ContactMessage> findAllByOrderByCreatedAtDesc();

	long countByEmailIgnoreCaseAndCreatedAtAfter(String email, LocalDateTime since);

	long countByHandledFalse();
}
