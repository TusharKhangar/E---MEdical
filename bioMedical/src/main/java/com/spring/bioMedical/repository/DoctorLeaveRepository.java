package com.spring.bioMedical.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.spring.bioMedical.entity.DoctorLeave;

public interface DoctorLeaveRepository extends JpaRepository<DoctorLeave, Long> {

	boolean existsByDoctorIdAndDate(Long doctorId, String date);

	/** Upcoming leave, soonest first (dates are ISO strings, so string order is date order). */
	List<DoctorLeave> findByDoctorIdAndDateGreaterThanEqualOrderByDate(Long doctorId, String fromDate);
}
