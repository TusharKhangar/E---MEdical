package com.spring.bioMedical.dto;

import java.util.List;

import com.spring.bioMedical.entity.Appointment;
import com.spring.bioMedical.entity.Prescription;

/** A prescription together with the visit it belongs to, as shown to the patient and printed. */
public record PrescriptionDto(Long id, Long appointmentId, String diagnosis, String notes, String followUpDate,
		List<PrescriptionRequest.MedicineLine> medicines, String visitDate, String visitTime, String patientName,
		String patientEmail, String doctorName, String department, String updatedAt) {

	public static PrescriptionDto of(Prescription p, Appointment a) {
		return new PrescriptionDto(p.getId(), a.getId(), p.getDiagnosis(), p.getNotes(), p.getFollowUpDate(),
				p.getMedicines().stream()
						.map(m -> new PrescriptionRequest.MedicineLine(m.getName(), m.getDosage(), m.getFrequency(), m.getDurationDays()))
						.toList(),
				a.getDate(), a.getTime(), a.getName(), a.getEmail(), a.getDoctorName(), a.getDepartment(),
				p.getUpdatedAt() == null ? null : p.getUpdatedAt().toString());
	}
}
