package com.spring.bioMedical;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.spring.bioMedical.entity.User;
import com.spring.bioMedical.repository.AppointmentRepository;
import com.spring.bioMedical.repository.PrescriptionRepository;
import com.spring.bioMedical.repository.UserRepository;

/** Doctors finishing a visit with a prescription, and who can read and download it. */
@SpringBootTest
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class PrescriptionIntegrationTest {

	private static final String PASSWORD = "Correct-Horse-Battery-42";

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private AppointmentRepository appointmentRepository;

	@Autowired
	private PrescriptionRepository prescriptionRepository;

	@Autowired
	private PasswordEncoder passwordEncoder;

	private Long appointmentId;
	private String patient;
	private String doctor;

	private static final Map<String, Object> PRESCRIPTION = Map.of(
			"diagnosis", "Viral fever",
			"notes", "Rest and fluids. Come back if the fever lasts more than 3 days.",
			"medicines", List.of(
					Map.of("name", "Paracetamol", "dosage", "500 mg", "frequency", "Three times a day", "durationDays", 3),
					Map.of("name", "ORS", "frequency", "After each loose motion")));

	@BeforeEach
	void setUp() throws Exception {
		prescriptionRepository.deleteAll();
		appointmentRepository.deleteAll();
		userRepository.deleteAll();
		User doc = createUser("doc@test.com", "ROLE_DOCTOR");
		createUser("doc2@test.com", "ROLE_DOCTOR");
		createUser("pat@test.com", "ROLE_USER");
		createUser("other@test.com", "ROLE_USER");
		createUser("admin@test.com", "ROLE_ADMIN");
		patient = login("pat@test.com");
		doctor = login("doc@test.com");

		String body = mockMvc.perform(post("/api/user/appointments").header("Authorization", "Bearer " + patient)
				.contentType(MediaType.APPLICATION_JSON).content(json(Map.of(
						"doctorId", doc.getId(), "date", LocalDate.now().plusDays(2).toString(), "time", "10:00", "description", "Fever"))))
				.andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
		appointmentId = objectMapper.readTree(body).get("id").asLong();
	}

	@Test
	void doctorMustConfirmBeforeWritingAPrescription() throws Exception {
		write(doctor).andExpect(status().isBadRequest()).andExpect(content().string(containsString("Confirm the appointment first")));
	}

	@Test
	void writingAPrescriptionCompletesTheVisitAndEveryoneEntitledCanReadIt() throws Exception {
		confirm();
		write(doctor)
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.diagnosis").value("Viral fever"))
				.andExpect(jsonPath("$.medicines.length()").value(2))
				.andExpect(jsonPath("$.medicines[0].dosage").value("500 mg"));

		mockMvc.perform(get("/api/user/appointments").header("Authorization", "Bearer " + patient))
				.andExpect(jsonPath("$[0].status").value("COMPLETED"))
				.andExpect(jsonPath("$[0].hasPrescription").value(true));

		for (String reader : List.of(patient, doctor, login("admin@test.com"))) {
			mockMvc.perform(get(path()).header("Authorization", "Bearer " + reader))
					.andExpect(status().isOk())
					.andExpect(jsonPath("$.patientEmail").value("pat@test.com"));
		}
		mockMvc.perform(get(path()).header("Authorization", "Bearer " + login("other@test.com"))).andExpect(status().isNotFound());
		mockMvc.perform(get(path()).header("Authorization", "Bearer " + login("doc2@test.com"))).andExpect(status().isNotFound());
	}

	@Test
	void onlyTheTreatingDoctorCanWriteIt() throws Exception {
		confirm();
		write(login("doc2@test.com")).andExpect(status().isNotFound());
		write(patient).andExpect(status().isForbidden());
	}

	@Test
	void editingReplacesTheMedicineList() throws Exception {
		confirm();
		write(doctor).andExpect(status().isOk());
		mockMvc.perform(put(path()).header("Authorization", "Bearer " + doctor).contentType(MediaType.APPLICATION_JSON)
				.content(json(Map.of("diagnosis", "Viral fever, recovering", "medicines",
						List.of(Map.of("name", "Vitamin C", "dosage", "500 mg", "durationDays", 7))))))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.medicines.length()").value(1))
				.andExpect(jsonPath("$.medicines[0].name").value("Vitamin C"));
		assertThat(prescriptionRepository.count()).isEqualTo(1);
	}

	@Test
	void validationAndPdfDownload() throws Exception {
		confirm();
		mockMvc.perform(put(path()).header("Authorization", "Bearer " + doctor).contentType(MediaType.APPLICATION_JSON)
				.content(json(Map.of("diagnosis", " "))))
				.andExpect(status().isBadRequest());
		mockMvc.perform(put(path()).header("Authorization", "Bearer " + doctor).contentType(MediaType.APPLICATION_JSON)
				.content(json(Map.of("diagnosis", "Flu", "followUpDate", LocalDate.now().toString()))))
				.andExpect(status().isBadRequest())
				.andExpect(content().string(containsString("after the visit")));

		write(doctor).andExpect(status().isOk());
		byte[] pdf = mockMvc.perform(get(path() + "/pdf").header("Authorization", "Bearer " + patient))
				.andExpect(status().isOk())
				.andExpect(header().string("Content-Type", "application/pdf"))
				.andExpect(header().string("Content-Disposition", containsString("prescription-")))
				.andReturn().getResponse().getContentAsByteArray();
		assertThat(new String(pdf, 0, 5)).isEqualTo("%PDF-");
		assertThat(pdf.length).isGreaterThan(1000);
	}

	private org.springframework.test.web.servlet.ResultActions write(String token) throws Exception {
		return mockMvc.perform(put(path()).header("Authorization", "Bearer " + token)
				.contentType(MediaType.APPLICATION_JSON).content(json(PRESCRIPTION)));
	}

	private void confirm() throws Exception {
		mockMvc.perform(patch("/api/doctor/appointments/" + appointmentId + "/status").header("Authorization", "Bearer " + doctor)
				.contentType(MediaType.APPLICATION_JSON).content(json(Map.of("status", "CONFIRMED"))))
				.andExpect(status().isOk());
	}

	private String path() {
		return "/api/appointments/" + appointmentId + "/prescription";
	}

	private User createUser(String email, String role) {
		User user = new User();
		user.setEmail(email);
		user.setFirstName("Test");
		user.setLastName("User");
		user.setRole(role);
		user.setEnabled(true);
		user.setPassword(passwordEncoder.encode(PASSWORD));
		user.setSpecialization("ROLE_DOCTOR".equals(role) ? "General Medicine" : null);
		return userRepository.save(user);
	}

	private String login(String email) throws Exception {
		String body = mockMvc.perform(post("/api/login").contentType(MediaType.APPLICATION_JSON)
				.content(json(Map.of("username", email, "password", PASSWORD))))
				.andExpect(status().isOk())
				.andReturn().getResponse().getContentAsString();
		return objectMapper.readTree(body).get("jwt").asText();
	}

	private String json(Object value) throws Exception {
		return objectMapper.writeValueAsString(value);
	}
}
