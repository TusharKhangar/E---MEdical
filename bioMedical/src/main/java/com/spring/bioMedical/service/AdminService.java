package com.spring.bioMedical.service;

import java.util.List;
import com.spring.bioMedical.entity.User;

public interface AdminService {


	public List<User> findByRole(String user);

	public User findByEmail(String user);

	public List<User> findAll();

	public void save(User admin);

	public void delete(User admin);

}
