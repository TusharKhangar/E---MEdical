package com.spring.bioMedical.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.spring.bioMedical.entity.Admin;
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
	public List<Admin> findAll() {
		return adminRepository.findAll();
	}

	@Override
	public void save(Admin admin)
	{
		
		adminRepository.save(admin);
	}

	@Override
	public void delete(Admin admin) {
		adminRepository.delete(admin);
	}

	@Override
	public Admin findByEmail(String user) {

		return adminRepository.findByEmail(user);
		
	}

	@Override
	public List<Admin> findByRole(String user) {
		return adminRepository.findByRole(user);
	}


}
