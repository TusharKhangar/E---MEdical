package com.spring.bioMedical.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

	/** HQL: one page of accounts with this role, optionally matching a search on name, e-mail or speciality. */
	@Query("""
			select u from User u
			where u.role = :role
			  and (:q is null
			       or lower(concat(u.firstName, ' ', u.lastName)) like :q
			       or lower(u.email) like :q
			       or lower(coalesce(u.specialization, '')) like :q)
			""")
	Page<User> search(@Param("role") String role, @Param("q") String q, Pageable pageable);
}
