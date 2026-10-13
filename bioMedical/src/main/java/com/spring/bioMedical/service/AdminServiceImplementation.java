package com.spring.bioMedical.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.spring.bioMedical.entity.User;
import com.spring.bioMedical.exception.ApiException;
import com.spring.bioMedical.repository.AdminRepository;


@Service
public class AdminServiceImplementation implements AdminService {

	private final AdminRepository adminRepository;

	//inject employee dao
	@Autowired   //Adding bean id @Qualifier
	public AdminServiceImplementation( AdminRepository obj)
	{
		adminRepository=obj;
	}
	
	@Override
	public List<User> findAll() {
		return adminRepository.findAll();
	}

	@Override
	public void save(User admin)
	{
		
		adminRepository.save(admin);
	}

	@Override
	public void delete(User admin) {
		adminRepository.delete(admin);
	}

	@Override
	public User findByEmail(String user) {

		return adminRepository.findByEmail(user);
		
	}

	@Override
	public List<User> findByRole(String user) {
		return adminRepository.findByRole(user);
	}

	public Optional<User> findById(Long id) {
		return adminRepository.findById(id);
	}

	/** An enabled doctor, or a 404 if the id is not one. */
	public User findDoctorById(Long id) {
		return adminRepository.findById(id)
				.filter(u -> "ROLE_DOCTOR".equals(u.getRole()) && u.getEnabled())
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Doctor not found"));
	}

	public long countByRole(String role) {
		return adminRepository.countByRole(role);
	}

	public Page<User> search(String role, String q, Pageable pageable) {
		return adminRepository.search(role, q, pageable);
	}
}
