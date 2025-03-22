package com.spring.bioMedical.repository;

import java.util.List;
import java.util.Optional;

import jakarta.annotation.Nonnull;
import jakarta.annotation.Nullable;
import  jakarta.persistence.EntityManager;
import  jakarta.persistence.TypedQuery;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import com.spring.bioMedical.entity.User;
/**
 *
 * @
 *
 *
 */
@Repository("userRepository")
public interface UserRepository extends JpaRepository<User, Long> {


	Optional<User> findByEmail(String email);
	Optional<User> findByConfirmationToken(String confirmationToken);
	List<User> findAll();
	Optional<User> findById(Long id);
}