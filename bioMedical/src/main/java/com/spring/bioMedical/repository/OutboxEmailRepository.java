package com.spring.bioMedical.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.spring.bioMedical.entity.OutboxEmail;

public interface OutboxEmailRepository extends JpaRepository<OutboxEmail, Long> {

	/** Ids of e-mails due now, oldest first. */
	@Query("select m.id from OutboxEmail m where m.status = 'PENDING' and m.nextAttemptAt <= :now order by m.id")
	List<Long> findDue(@Param("now") LocalDateTime now, Pageable limit);

	/**
	 * Takes one e-mail for this worker. The status check in the WHERE clause makes it atomic: if two workers
	 * (or two app instances) race, only one update matches, so a race never sends an e-mail twice.
	 */
	@Modifying
	@Query("update OutboxEmail m set m.status = 'SENDING', m.claimedAt = :now where m.id = :id and m.status = 'PENDING'")
	int claim(@Param("id") Long id, @Param("now") LocalDateTime now);

	/** A worker that died mid-send leaves SENDING behind; put those back in the queue. */
	@Modifying
	@Query("update OutboxEmail m set m.status = 'PENDING' where m.status = 'SENDING' and m.claimedAt < :before")
	int releaseStuck(@Param("before") LocalDateTime before);

	/** Sent mail holds sign-up and reset links, so it isn't kept longer than needed. */
	@Modifying
	@Query("delete from OutboxEmail m where m.status in ('SENT', 'LOGGED') and m.createdAt < :before")
	int purgeDelivered(@Param("before") LocalDateTime before);

	long countByStatus(String status);
}
