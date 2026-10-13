package com.spring.bioMedical.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.spring.bioMedical.entity.Appointment;
import com.spring.bioMedical.exception.ApiException;
import com.spring.bioMedical.repository.AppointmentRepository;

/**
 * Numbers for the admin analytics page. Every figure is one grouped HQL query over the chosen range
 * (the last N days up to today, plus the next two weeks already booked), so the page stays fast at any size.
 */
@Service
public class AnalyticsService {

	public static final int UPCOMING_DAYS = 14;

	private final AppointmentRepository appointments;

	public AnalyticsService(AppointmentRepository appointments) {
		this.appointments = appointments;
	}

	public record Count(String label, long count) {}

	public record DoctorLoad(Long doctorId, String doctorName, long appointments, long completed, long cancelled) {}

	public record Analytics(String from, String today, String to, long total, double completionRate,
			double cancellationRate, List<Count> perDay, List<Count> perStatus, List<Count> perDepartment,
			List<Count> perTime, List<DoctorLoad> topDoctors) {}

	public Analytics forLastDays(int days) {
		if (days < 1 || days > 365) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "Choose a range between 1 and 365 days.");
		}
		LocalDate today = LocalDate.now();
		LocalDate start = today.minusDays(days - 1L);
		LocalDate end = today.plusDays(UPCOMING_DAYS);
		String from = start.toString();
		String to = end.toString();

		// Every day in the range, including days with no appointments, so the chart has no gaps
		Map<String, Long> byDay = new LinkedHashMap<>();
		for (LocalDate d = start; !d.isAfter(end); d = d.plusDays(1)) {
			byDay.put(d.toString(), 0L);
		}
		for (Object[] row : appointments.countPerDay(from, to)) {
			byDay.computeIfPresent((String) row[0], (k, v) -> (Long) row[1]);
		}

		Map<String, Long> byStatus = new LinkedHashMap<>();
		for (String s : List.of(Appointment.PENDING, Appointment.CONFIRMED, Appointment.COMPLETED, Appointment.CANCELLED)) {
			byStatus.put(s, 0L);
		}
		for (Object[] row : appointments.countPerStatus(from, to)) {
			byStatus.merge(row[0] == null ? Appointment.PENDING : (String) row[0], (Long) row[1], Long::sum);
		}
		long total = byStatus.values().stream().mapToLong(Long::longValue).sum();
		long completed = byStatus.get(Appointment.COMPLETED);
		long cancelled = byStatus.get(Appointment.CANCELLED);

		List<DoctorLoad> doctors = appointments.topDoctors(from, to, PageRequest.of(0, 5)).stream()
				.map(r -> new DoctorLoad((Long) r[0], (String) r[1], (Long) r[2], number(r[3]), number(r[4])))
				.toList();

		// Completion counts only visits that are over (completed or cancelled), not ones still to come
		return new Analytics(from, today.toString(), to, total, rate(completed, completed + cancelled), rate(cancelled, total),
				toCounts(byDay), toCounts(byStatus), counts(appointments.countPerDepartment(from, to), "General"),
				counts(appointments.countPerTime(from, to), "Unknown"), doctors);
	}

	private static List<Count> toCounts(Map<String, Long> map) {
		List<Count> list = new ArrayList<>();
		map.forEach((k, v) -> list.add(new Count(k, v)));
		return list;
	}

	private static List<Count> counts(List<Object[]> rows, String nullLabel) {
		Map<String, Long> merged = new LinkedHashMap<>();
		for (Object[] r : rows) {
			String label = r[0] == null || ((String) r[0]).isBlank() ? nullLabel : (String) r[0];
			merged.merge(label, (Long) r[1], Long::sum);
		}
		return toCounts(merged);
	}

	private static long number(Object o) {
		return o == null ? 0 : ((Number) o).longValue();
	}

	private static double rate(long part, long total) {
		return total == 0 ? 0 : Math.round(part * 1000.0 / total) / 10.0;
	}
}
