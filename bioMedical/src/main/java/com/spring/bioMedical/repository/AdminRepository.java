package com.spring.bioMedical.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
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
}
