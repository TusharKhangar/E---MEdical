package com.spring.bioMedical.service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.spring.bioMedical.entity.Appointment;
import com.spring.bioMedical.repository.AppointmentRepository;

/**
 * Every evening, e-mails each patient with a pending or confirmed appointment the next day. Each
 * appointment is reminded once (reminder_sent), so a restart or a second run never sends duplicates.
 */
@Component
@ConditionalOnProperty(name = "app.reminders.enabled", havingValue = "true", matchIfMissing = true)
public class ReminderJob {

	private static final Logger logger = LoggerFactory.getLogger(ReminderJob.class);

	private final AppointmentRepository appointments;
	private final NotificationService notifications;
	private final ZoneId zone;

	public ReminderJob(AppointmentRepository appointments, NotificationService notifications,
			@Value("${app.time-zone:Asia/Kolkata}") String zone) {
		this.appointments = appointments;
		this.notifications = notifications;
		this.zone = ZoneId.of(zone);
	}

	@Scheduled(cron = "${app.reminders.cron:0 0 18 * * *}", zone = "${app.time-zone:Asia/Kolkata}")
	public void sendTomorrowsReminders() {
		int sent = sendRemindersFor(LocalDate.now(zone).plusDays(1));
		logger.info("Sent {} appointment reminder(s)", sent);
	}

	/** Reminds every not-yet-reminded active appointment on this date; returns how many were sent. */
	@Transactional
	public int sendRemindersFor(LocalDate date) {
		List<Appointment> due = appointments.findDueReminders(date.toString());
		for (Appointment a : due) {
			notifications.reminder(a);
			a.setReminderSent(true);
		}
		appointments.saveAll(due);
		return due.size();
	}
}
