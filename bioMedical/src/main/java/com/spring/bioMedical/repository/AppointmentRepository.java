package com.spring.bioMedical.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

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

	/** HQL: active appointments on a date whose reminder e-mail hasn't gone out yet. */
	@Query("""
			select a from Appointment a
			where a.date = :date
			  and (a.status is null or a.status in ('PENDING', 'CONFIRMED'))
			  and (a.reminderSent is null or a.reminderSent = false)
			""")
	List<Appointment> findDueReminders(@Param("date") String date);

	/** HQL: pending or confirmed appointments a doctor has on a date. */
	@Query("""
			select count(a) from Appointment a
			where a.doctorId = :doctorId and a.date = :date
			  and (a.status is null or a.status in ('PENDING', 'CONFIRMED'))
			""")
	long countActiveForDoctorOn(@Param("doctorId") Long doctorId, @Param("date") String date);

	// ---- Admin analytics (HQL group-bys over a date range; dates are stored as yyyy-MM-dd so they sort as text) ----

	@Query("select a.date, count(a) from Appointment a where a.date between :from and :to group by a.date order by a.date")
	List<Object[]> countPerDay(@Param("from") String from, @Param("to") String to);

	@Query("select a.status, count(a) from Appointment a where a.date between :from and :to group by a.status")
	List<Object[]> countPerStatus(@Param("from") String from, @Param("to") String to);

	@Query("""
			select a.department, count(a) from Appointment a
			where a.date between :from and :to
			group by a.department order by count(a) desc
			""")
	List<Object[]> countPerDepartment(@Param("from") String from, @Param("to") String to);

	@Query("select a.time, count(a) from Appointment a where a.date between :from and :to group by a.time order by a.time")
	List<Object[]> countPerTime(@Param("from") String from, @Param("to") String to);

	/** Busiest doctors: [doctorId, doctorName, appointments, completed, cancelled]. */
	@Query("""
			select a.doctorId, a.doctorName, count(a),
			       sum(case when a.status = 'COMPLETED' then 1 else 0 end),
			       sum(case when a.status = 'CANCELLED' then 1 else 0 end)
			from Appointment a
			where a.date between :from and :to and a.doctorId is not null
			group by a.doctorId, a.doctorName
			order by count(a) desc
			""")
	List<Object[]> topDoctors(@Param("from") String from, @Param("to") String to, Pageable page);

	/** HQL: one page of appointments; every filter is optional (null means "any"). */
	@Query("""
			select a from Appointment a
			where (:status is null or a.status = :status)
			  and (:doctorId is null or a.doctorId = :doctorId)
			  and (:from is null or a.date >= :from)
			  and (:to is null or a.date <= :to)
			  and (:q is null
			       or lower(a.name) like :q
			       or lower(a.email) like :q
			       or lower(a.doctorName) like :q
			       or lower(coalesce(a.department, '')) like :q)
			""")
	Page<Appointment> search(@Param("q") String q, @Param("status") String status, @Param("doctorId") Long doctorId,
			@Param("from") String from, @Param("to") String to, Pageable pageable);
}
