package com.spring.bioMedical.service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.spring.bioMedical.entity.DoctorLeave;
import com.spring.bioMedical.entity.DoctorSchedule;
import com.spring.bioMedical.exception.ApiException;
import com.spring.bioMedical.repository.AppointmentRepository;
import com.spring.bioMedical.repository.DoctorLeaveRepository;
import com.spring.bioMedical.repository.DoctorScheduleRepository;

/**
 * Doctors' weekly working hours and days off, and the hourly slots they produce. Every slot starts on
 * the hour; 13:00 to 14:00 is the clinic lunch break and is never bookable.
 */
@Service
public class ScheduleService {

	public static final String DEFAULT_START = "09:00";
	public static final String DEFAULT_END = "18:00";
	static final LocalTime LUNCH = LocalTime.of(13, 0);
	static final LocalTime EARLIEST = LocalTime.of(6, 0);
	static final LocalTime LATEST_END = LocalTime.of(22, 0);

	/** One day of the weekly plan, as shown and edited in the UI. */
	public record Day(int dayOfWeek, String name, boolean working, String startTime, String endTime) {
	}

	private final DoctorScheduleRepository schedules;
	private final DoctorLeaveRepository leaves;
	private final AppointmentRepository appointments;

	public ScheduleService(DoctorScheduleRepository schedules, DoctorLeaveRepository leaves,
			AppointmentRepository appointments) {
		this.schedules = schedules;
		this.leaves = leaves;
		this.appointments = appointments;
	}

	/** Monday to Sunday, with the clinic default for days the doctor never changed. */
	public List<Day> weeklySchedule(Long doctorId) {
		Map<Integer, DoctorSchedule> saved = schedules.findByDoctorIdOrderByDayOfWeek(doctorId).stream()
				.collect(Collectors.toMap(DoctorSchedule::getDayOfWeek, Function.identity()));
		List<Day> week = new ArrayList<>();
		for (DayOfWeek dow : DayOfWeek.values()) {
			DoctorSchedule s = saved.get(dow.getValue());
			week.add(s == null
					? new Day(dow.getValue(), displayName(dow), true, DEFAULT_START, DEFAULT_END)
					: new Day(dow.getValue(), displayName(dow), s.isWorking(), s.getStartTime(), s.getEndTime()));
		}
		return week;
	}

	@Transactional
	public List<Day> updateWeeklySchedule(Long doctorId, List<Day> days) {
		for (Day day : days) {
			if (day.dayOfWeek() < 1 || day.dayOfWeek() > 7) {
				throw new ApiException(HttpStatus.BAD_REQUEST, "Unknown day of the week.");
			}
			LocalTime start = hour(day.startTime());
			LocalTime end = hour(day.endTime());
			if (day.working() && (start.isBefore(EARLIEST) || end.isAfter(LATEST_END) || !start.isBefore(end))) {
				throw new ApiException(HttpStatus.BAD_REQUEST, displayName(DayOfWeek.of(day.dayOfWeek()))
						+ ": working hours must be between 06:00 and 22:00, and start before they end.");
			}
			DoctorSchedule row = schedules.findByDoctorIdAndDayOfWeek(doctorId, day.dayOfWeek())
					.orElseGet(() -> new DoctorSchedule(doctorId, day.dayOfWeek(), true, DEFAULT_START, DEFAULT_END));
			row.setWorking(day.working());
			row.setStartTime(format(start));
			row.setEndTime(format(end));
			schedules.save(row);
		}
		return weeklySchedule(doctorId);
	}

	/** Bookable start times for a doctor on a date, before removing booked or past slots. */
	public List<String> workingSlots(Long doctorId, LocalDate date) {
		if (leaves.existsByDoctorIdAndDate(doctorId, date.toString())) {
			return List.of();
		}
		int dow = date.getDayOfWeek().getValue();
		DoctorSchedule s = schedules.findByDoctorIdAndDayOfWeek(doctorId, dow).orElse(null);
		if (s != null && !s.isWorking()) {
			return List.of();
		}
		LocalTime start = hour(s == null ? DEFAULT_START : s.getStartTime());
		LocalTime end = hour(s == null ? DEFAULT_END : s.getEndTime());
		List<String> slots = new ArrayList<>();
		for (LocalTime t = start; t.isBefore(end); t = t.plusHours(1)) {
			if (!t.equals(LUNCH)) {
				slots.add(format(t));
			}
		}
		return slots;
	}

	public List<DoctorLeave> upcomingLeave(Long doctorId) {
		return leaves.findByDoctorIdAndDateGreaterThanEqualOrderByDate(doctorId, LocalDate.now().toString());
	}

	/** Blocks a whole day. Refused while the doctor still has active appointments that day. */
	@Transactional
	public DoctorLeave addLeave(Long doctorId, String date, String reason) {
		LocalDate day = parse(date);
		if (day.isBefore(LocalDate.now())) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "Leave can only be added for today or later.");
		}
		if (leaves.existsByDoctorIdAndDate(doctorId, day.toString())) {
			throw new ApiException(HttpStatus.CONFLICT, "You already have leave on " + day + ".");
		}
		long booked = appointments.countActiveForDoctorOn(doctorId, day.toString());
		if (booked > 0) {
			throw new ApiException(HttpStatus.CONFLICT, "You have " + booked + " appointment" + (booked == 1 ? "" : "s")
					+ " on " + day + ". Cancel them first so the patients are told, then add the leave.");
		}
		DoctorLeave leave = new DoctorLeave();
		leave.setDoctorId(doctorId);
		leave.setDate(day.toString());
		leave.setReason(reason == null || reason.isBlank() ? null : reason.trim());
		return leaves.save(leave);
	}

	@Transactional
	public void removeLeave(Long doctorId, Long leaveId) {
		DoctorLeave leave = leaves.findById(leaveId)
				.filter(l -> l.getDoctorId().equals(doctorId))
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Leave not found"));
		leaves.delete(leave);
	}

	private static LocalTime hour(String value) {
		try {
			LocalTime t = LocalTime.parse(value);
			if (t.getMinute() != 0) {
				throw new ApiException(HttpStatus.BAD_REQUEST, "Working hours must start and end on the hour.");
			}
			return t;
		} catch (DateTimeParseException | NullPointerException e) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "Please enter times as HH:00.");
		}
	}

	private static LocalDate parse(String date) {
		try {
			return LocalDate.parse(date);
		} catch (DateTimeParseException | NullPointerException e) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "Please choose a valid date.");
		}
	}

	private static String format(LocalTime t) {
		return String.format("%02d:00", t.getHour());
	}

	private static String displayName(DayOfWeek dow) {
		String n = dow.name();
		return n.charAt(0) + n.substring(1).toLowerCase();
	}
}
