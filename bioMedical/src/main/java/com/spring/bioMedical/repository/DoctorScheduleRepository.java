package com.spring.bioMedical.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.spring.bioMedical.entity.DoctorSchedule;

public interface DoctorScheduleRepository extends JpaRepository<DoctorSchedule, Long> {

	List<DoctorSchedule> findByDoctorIdOrderByDayOfWeek(Long doctorId);

	Optional<DoctorSchedule> findByDoctorIdAndDayOfWeek(Long doctorId, int dayOfWeek);
}
