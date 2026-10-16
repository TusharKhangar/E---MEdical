package com.spring.bioMedical.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.spring.bioMedical.entity.AuditEvent;

public interface AuditEventRepository extends JpaRepository<AuditEvent, Long> {

	/** HQL: one page of events, optionally one action and/or a search on who did it or to whom. */
	@Query("""
			select e from AuditEvent e
			where (:action is null or e.action = :action)
			  and (:q is null or lower(e.actor) like :q or lower(e.target) like :q)
			""")
	Page<AuditEvent> search(@Param("action") String action, @Param("q") String q, Pageable pageable);
}
