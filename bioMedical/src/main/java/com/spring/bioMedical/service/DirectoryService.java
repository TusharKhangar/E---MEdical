package com.spring.bioMedical.service;

import java.util.List;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import com.spring.bioMedical.config.CacheConfig;
import com.spring.bioMedical.dto.AdminDto;
import com.spring.bioMedical.entity.User;

/** The public doctor directory, cached for a minute (it is on the home page, booking page and doctors page). */
@Service
public class DirectoryService {

	private final AdminServiceImplementation users;

	public DirectoryService(AdminServiceImplementation users) {
		this.users = users;
	}

	/** Active doctors without their contact details, which are not public. */
	@Cacheable(CacheConfig.DOCTORS)
	public List<AdminDto> activeDoctors() {
		return users.findByRole("ROLE_DOCTOR").stream()
				.filter(User::getEnabled)
				.map(DirectoryService::publicView)
				.toList();
	}

	private static AdminDto publicView(User doctor) {
		AdminDto dto = new AdminDto(doctor);
		dto.setEmail(null);
		dto.setPhoneNumber(null);
		dto.setLastseen(null);
		return dto;
	}
}
