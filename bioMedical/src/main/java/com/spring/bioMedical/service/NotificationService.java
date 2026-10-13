package com.spring.bioMedical.service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.stereotype.Service;

import com.spring.bioMedical.entity.Appointment;
import com.spring.bioMedical.repository.AdminRepository;

/**
 * The e-mails patients and doctors get about appointments. Sending is asynchronous (EmailService),
 * so a slow or failing mail server never delays or breaks a booking.
 */
@Service
public class NotificationService {

	private static final DateTimeFormatter LONG_DATE = DateTimeFormatter.ofPattern("EEEE d MMMM yyyy");

	private final EmailService emailService;
	private final AdminRepository users;

	@Value("${app.frontend-url:http://localhost:5173}")
	private String frontendUrl;

	public NotificationService(EmailService emailService, AdminRepository users) {
		this.emailService = emailService;
		this.users = users;
	}

	public void bookingReceived(Appointment a) {
		send(a.getEmail(), "Appointment request received",
				"Hello " + a.getName() + ",\n\nWe received your request to see " + a.getDoctorName() + " on " + when(a)
						+ ". The doctor will confirm it shortly; we'll e-mail you when they do.\n\n" + manageLink());
		doctorEmail(a, "New appointment request",
				a.getName() + " asked for an appointment on " + when(a) + "."
						+ (a.getDescription() == null || a.getDescription().isBlank() ? "" : "\nReason: " + a.getDescription())
						+ "\n\nConfirm or decline it in your dashboard:\n" + frontendUrl + "/dashboard/appointments");
	}

	/** After a doctor or admin changes the status. Patients cancelling their own visit tell the doctor instead. */
	public void statusChanged(Appointment a, boolean changedByPatient) {
		switch (a.getStatus()) {
			case Appointment.CONFIRMED -> send(a.getEmail(), "Your appointment is confirmed",
					"Hello " + a.getName() + ",\n\n" + a.getDoctorName() + " confirmed your appointment on " + when(a)
							+ ". Please arrive 15 minutes early.\n\n" + manageLink());
			case Appointment.CANCELLED -> {
				if (changedByPatient) {
					doctorEmail(a, "Appointment cancelled by the patient",
							a.getName() + " cancelled their appointment on " + when(a) + ". The slot is free again.");
				} else {
					send(a.getEmail(), "Your appointment was cancelled",
							"Hello " + a.getName() + ",\n\nYour appointment with " + a.getDoctorName() + " on " + when(a)
									+ " was cancelled by the clinic. You can book another time here:\n" + frontendUrl
									+ "/dashboard/make-appointment");
				}
			}
			case Appointment.COMPLETED -> send(a.getEmail(), "Thanks for visiting",
					"Hello " + a.getName() + ",\n\nYour visit with " + a.getDoctorName() + " is complete."
							+ (Boolean.TRUE.equals(a.getHasPrescription())
									? " Your prescription is ready to view and download in your dashboard."
									: "")
							+ "\n\n" + manageLink());
			default -> {
				// No e-mail for other states
			}
		}
	}

	public void rescheduled(Appointment a) {
		send(a.getEmail(), "Appointment moved",
				"Hello " + a.getName() + ",\n\nYour appointment with " + a.getDoctorName() + " is now on " + when(a)
						+ ". The doctor will confirm the new time.\n\n" + manageLink());
		doctorEmail(a, "Appointment moved by the patient",
				a.getName() + " moved their appointment to " + when(a) + ". Please confirm the new time in your dashboard.");
	}

	public void reminder(Appointment a) {
		send(a.getEmail(), "Reminder: appointment tomorrow",
				"Hello " + a.getName() + ",\n\nThis is a reminder of your appointment with " + a.getDoctorName() + " tomorrow, "
						+ when(a) + ".\nNeed to change it? Reschedule or cancel here:\n" + frontendUrl + "/dashboard/appointments");
	}

	private void doctorEmail(Appointment a, String subject, String body) {
		if (a.getDoctorId() == null) {
			return;
		}
		users.findById(a.getDoctorId()).ifPresent(d -> send(d.getEmail(), subject, "Hello " + a.getDoctorName() + ",\n\n" + body));
	}

	private void send(String to, String subject, String text) {
		SimpleMailMessage m = new SimpleMailMessage();
		m.setTo(to);
		m.setSubject("E-Medical: " + subject);
		m.setText(text + "\n\nE-Medical");
		emailService.sendEmail(m);
	}

	private String manageLink() {
		return "See your appointments: " + frontendUrl + "/dashboard/appointments";
	}

	private static String when(Appointment a) {
		try {
			return LocalDate.parse(a.getDate()).format(LONG_DATE) + " at " + a.getTime();
		} catch (Exception e) {
			return a.getDate() + " at " + a.getTime();
		}
	}
}
