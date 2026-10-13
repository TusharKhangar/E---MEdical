package com.spring.bioMedical.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.spring.bioMedical.entity.Appointment;

/**
 *
 * @
 *
 *
 */
@Repository("appointmentRepository")
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

	List<Appointment> findByEmailOrderByDateDescTimeDesc(String email);

	List<Appointment> findByDoctorIdOrderByDateDescTimeDesc(Long doctorId);

	List<Appointment> findAllByOrderByDateDescTimeDesc();

	/** HQL: does this doctor already have a pending or confirmed appointment in this slot? */
	@Query("""
			select count(a) > 0 from Appointment a
			where a.doctorId = :doctorId and a.date = :date and a.time = :time
			  and (a.status is null or a.status in ('PENDING', 'CONFIRMED'))
			""")
	boolean isSlotTaken(@Param("doctorId") Long doctorId, @Param("date") String date, @Param("time") String time);

	/** HQL: is this patient already booked (with any doctor) at this date and time? */
	@Query("""
			select count(a) > 0 from Appointment a
			where lower(a.email) = lower(:email) and a.date = :date and a.time = :time
			  and (a.status is null or a.status in ('PENDING', 'CONFIRMED'))
			""")
	boolean patientHasAppointmentAt(@Param("email") String email, @Param("date") String date, @Param("time") String time);

	/** HQL: the times already taken for a doctor on a given day. */
	@Query("""
			select a.time from Appointment a
			where a.doctorId = :doctorId and a.date = :date
			  and (a.status is null or a.status in ('PENDING', 'CONFIRMED'))
			""")
	List<String> findTakenTimes(@Param("doctorId") Long doctorId, @Param("date") String date);

	long countByStatus(String status);

	/** HQL: pending or confirmed appointments a doctor has on a date. */
	@Query("""
			select count(a) from Appointment a
			where a.doctorId = :doctorId and a.date = :date
			  and (a.status is null or a.status in ('PENDING', 'CONFIRMED'))
			""")
	long countActiveForDoctorOn(@Param("doctorId") Long doctorId, @Param("date") String date);
}
