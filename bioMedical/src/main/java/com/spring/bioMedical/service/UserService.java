package com.spring.bioMedical.service;

import java.util.List;
import java.util.Optional;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.spring.bioMedical.entity.User;
import com.spring.bioMedical.repository.UserRepository;


@Service("userService")
public class UserService {

	private static final Logger logger = LoggerFactory.getLogger(UserService.class);
	private final UserRepository userRepository;

	@Autowired
	public UserService(UserRepository userRepository) {
		this.userRepository = userRepository;
	}

	public Optional<User> findByEmail(String email) {
		logger.info("Finding user by email: {}", email);
		return userRepository.findByEmail(email);
	}

	public Optional<User> findByConfirmationToken(String confirmationToken) {
		logger.info("Finding user by confirmation token: {}", confirmationToken);
		return userRepository.findByConfirmationToken(confirmationToken);
	}

	public void saveUser(User user) {
		logger.info("Saving user: {}", user);
		userRepository.save(user);
	}

	public List<User> findAll() {
		logger.info("Finding all users");
		return userRepository.findAll();
	}

}