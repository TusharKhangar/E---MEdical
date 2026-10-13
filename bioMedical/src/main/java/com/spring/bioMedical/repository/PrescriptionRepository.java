package com.spring.bioMedical.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.spring.bioMedical.entity.Prescription;

public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {

	Optional<Prescription> findByAppointmentId(Long appointmentId);
}
