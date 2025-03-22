package com.spring.bioMedical.config;

import com.spring.bioMedical.entity.User;
import com.spring.bioMedical.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class CustomUserDetailService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Logger logger = LoggerFactory.getLogger(UserDetails.class);
        logger.debug("loadUserByUsername called for username: {}", username); // Add this line
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));

        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                user.getEnabled(),
                true, true, true,
                Collections.singleton(new SimpleGrantedAuthority(user.getRole()))
        );
        logger.debug("loadUserByUsername returning UserDetails for user: {}", user.getEmail()); // Add this
        return userDetails;
    }
}