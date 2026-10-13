package com.spring.bioMedical.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;
import org.springframework.stereotype.Repository;

import com.spring.bioMedical.entity.User;

/**
 * 
 * @
 *  
 *
 */
@Repository("adminRepository")
public interface AdminRepository extends JpaRepository<User, Long> {

	User findByEmail(String user);
	
	List<User> findByRole(String user);

	long countByRole(String role);

	/** Row-locks these users until the current transaction ends (SELECT ... FOR UPDATE), in id order. */
	@Lock(LockModeType.PESSIMISTIC_WRITE)
	@Query("select u from User u where u.id in :ids order by u.id")
	List<User> lockForBooking(@Param("ids") List<Long> ids);
}
