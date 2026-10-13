package com.spring.bioMedical;

import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.empty;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
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
import com.spring.bioMedical.repository.DoctorLeaveRepository;
import com.spring.bioMedical.repository.DoctorScheduleRepository;
import com.spring.bioMedical.repository.UserRepository;

/** Doctors' working hours and days off, and patients moving appointments to another time. */
@SpringBootTest
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class ScheduleIntegrationTest {

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
	private DoctorScheduleRepository scheduleRepository;

	@Autowired
	private DoctorLeaveRepository leaveRepository;

	@Autowired
	private PasswordEncoder passwordEncoder;

	private User doctor;
	private String doctorToken;
	private String patientToken;

	/** A Monday at least a week out, so it's always bookable. */
	private final LocalDate monday = LocalDate.now().plusDays(7).with(TemporalAdjusters.nextOrSame(DayOfWeek.MONDAY));
	private final LocalDate tuesday = monday.plusDays(1);

	@BeforeEach
	void setUp() throws Exception {
		appointmentRepository.deleteAll();
		scheduleRepository.deleteAll();
		leaveRepository.deleteAll();
		userRepository.deleteAll();
		doctor = createUser("doc@test.com", "ROLE_DOCTOR");
		createUser("pat@test.com", "ROLE_USER");
		createUser("other@test.com", "ROLE_USER");
		doctorToken = login("doc@test.com");
		patientToken = login("pat@test.com");
	}

	@Test
	void defaultScheduleIsNineToSixWithLunch() throws Exception {
		mockMvc.perform(get("/api/doctor/schedule").header("Authorization", "Bearer " + doctorToken))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(7)))
				.andExpect(jsonPath("$[0].name").value("Monday"))
				.andExpect(jsonPath("$[0].startTime").value("09:00"))
				.andExpect(jsonPath("$[0].endTime").value("18:00"));
		mockMvc.perform(get(slots(monday)))
				.andExpect(jsonPath("$.slots", contains("09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00")));
	}

	@Test
	void customHoursAndDaysOffChangeWhatCanBeBooked() throws Exception {
		mockMvc.perform(put("/api/doctor/schedule").header("Authorization", "Bearer " + doctorToken)
				.contentType(MediaType.APPLICATION_JSON).content(json(List.of(
						Map.of("dayOfWeek", 1, "working", false, "startTime", "09:00", "endTime", "18:00"),
						Map.of("dayOfWeek", 2, "working", true, "startTime", "10:00", "endTime", "12:00")))))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[0].working").value(false));

		mockMvc.perform(get(slots(monday))).andExpect(jsonPath("$.slots", empty()));
		mockMvc.perform(get(slots(tuesday))).andExpect(jsonPath("$.slots", contains("10:00", "11:00")));

		book(monday, "10:00").andExpect(status().isBadRequest())
				.andExpect(content().string(containsString("isn't working")));
		book(tuesday, "14:00").andExpect(status().isBadRequest());
		book(tuesday, "11:00").andExpect(status().isCreated());
	}

	@Test
	void invalidHoursAreRejected() throws Exception {
		mockMvc.perform(put("/api/doctor/schedule").header("Authorization", "Bearer " + doctorToken)
				.contentType(MediaType.APPLICATION_JSON).content(json(List.of(
						Map.of("dayOfWeek", 3, "working", true, "startTime", "17:00", "endTime", "09:00")))))
				.andExpect(status().isBadRequest())
				.andExpect(content().string(containsString("Wednesday")));
		mockMvc.perform(put("/api/doctor/schedule").header("Authorization", "Bearer " + doctorToken)
				.contentType(MediaType.APPLICATION_JSON).content(json(List.of(
						Map.of("dayOfWeek", 3, "working", true, "startTime", "09:30", "endTime", "12:00")))))
				.andExpect(status().isBadRequest());
	}

	@Test
	void leaveBlocksTheDayAndIsRefusedWhenPatientsAreBooked() throws Exception {
		book(tuesday, "10:00").andExpect(status().isCreated());
		mockMvc.perform(post("/api/doctor/leave").header("Authorization", "Bearer " + doctorToken)
				.contentType(MediaType.APPLICATION_JSON).content(json(Map.of("date", tuesday.toString()))))
				.andExpect(status().isConflict())
				.andExpect(content().string(containsString("1 appointment")));

		mockMvc.perform(post("/api/doctor/leave").header("Authorization", "Bearer " + doctorToken)
				.contentType(MediaType.APPLICATION_JSON).content(json(Map.of("date", monday.toString(), "reason", "Conference"))))
				.andExpect(status().isCreated());
		mockMvc.perform(get(slots(monday))).andExpect(jsonPath("$.slots", empty()));
		book(monday, "09:00").andExpect(status().isBadRequest());
		mockMvc.perform(get("/api/doctor/leave").header("Authorization", "Bearer " + doctorToken))
				.andExpect(jsonPath("$", hasSize(1)))
				.andExpect(jsonPath("$[0].reason").value("Conference"));

		Long leaveId = leaveRepository.findAll().get(0).getId();
		mockMvc.perform(delete("/api/doctor/leave/" + leaveId).header("Authorization", "Bearer " + doctorToken))
				.andExpect(status().isNoContent());
		mockMvc.perform(get(slots(monday))).andExpect(jsonPath("$.slots", hasSize(8)));
	}

	@Test
	void patientReschedulesToAFreeSlotAndItNeedsConfirmingAgain() throws Exception {
		Long id = idOf(book(tuesday, "10:00").andExpect(status().isCreated()).andReturn().getResponse().getContentAsString());
		mockMvc.perform(patch("/api/doctor/appointments/" + id + "/status").header("Authorization", "Bearer " + doctorToken)
				.contentType(MediaType.APPLICATION_JSON).content(json(Map.of("status", "CONFIRMED"))))
				.andExpect(jsonPath("$.status").value("CONFIRMED"));

		// Another patient holds 11:00
		mockMvc.perform(post("/api/user/appointments").header("Authorization", "Bearer " + login("other@test.com"))
				.contentType(MediaType.APPLICATION_JSON)
				.content(json(Map.of("doctorId", doctor.getId(), "date", tuesday.toString(), "time", "11:00"))))
				.andExpect(status().isCreated());

		reschedule(patientToken, id, tuesday, "11:00").andExpect(status().isConflict());
		reschedule(patientToken, id, tuesday, "10:00").andExpect(status().isBadRequest());
		reschedule(login("other@test.com"), id, tuesday, "15:00").andExpect(status().isNotFound());

		reschedule(patientToken, id, tuesday, "15:00")
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.time").value("15:00"))
				.andExpect(jsonPath("$.status").value("PENDING"));
		// The old slot is free again
		mockMvc.perform(get(slots(tuesday))).andExpect(jsonPath("$.slots", org.hamcrest.Matchers.hasItem("10:00")));
	}

	private org.springframework.test.web.servlet.ResultActions book(LocalDate date, String time) throws Exception {
		return mockMvc.perform(post("/api/user/appointments").header("Authorization", "Bearer " + patientToken)
				.contentType(MediaType.APPLICATION_JSON)
				.content(json(Map.of("doctorId", doctor.getId(), "date", date.toString(), "time", time))));
	}

	private org.springframework.test.web.servlet.ResultActions reschedule(String token, Long id, LocalDate date, String time)
			throws Exception {
		return mockMvc.perform(patch("/api/user/appointments/" + id + "/reschedule").header("Authorization", "Bearer " + token)
				.contentType(MediaType.APPLICATION_JSON).content(json(Map.of("date", date.toString(), "time", time))));
	}

	private String slots(LocalDate date) {
		return "/api/doctors/" + doctor.getId() + "/slots?date=" + date;
	}

	private Long idOf(String body) throws Exception {
		return objectMapper.readTree(body).get("id").asLong();
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
