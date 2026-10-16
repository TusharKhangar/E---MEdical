package com.spring.bioMedical;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
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
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.spring.bioMedical.entity.Appointment;
import com.spring.bioMedical.entity.User;
import com.spring.bioMedical.repository.AppointmentRepository;
import com.spring.bioMedical.repository.AuditEventRepository;
import com.spring.bioMedical.repository.UserRepository;

/** Every administrator action lands in the audit log with who, what and to whom; only admins can read it. */
@SpringBootTest
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class AuditLogIntegrationTest {

	private static final String PASSWORD = "Correct-Horse-Battery-42";

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

	@Autowired
	private UserRepository users;

	@Autowired
	private AppointmentRepository appointments;

	@Autowired
	private AuditEventRepository auditEvents;

	@Autowired
	private PasswordEncoder passwordEncoder;

	private String adminToken;

	@BeforeEach
	void setUp() throws Exception {
		auditEvents.deleteAll();
		appointments.deleteAll();
		users.deleteAll();
		create("admin@test.com", "ROLE_ADMIN");
		adminToken = login("admin@test.com");
	}

	@Test
	void disableEnableAndDeleteAreRecordedWithWhoAndWhom() throws Exception {
		User patient = create("pat@test.com", "ROLE_USER");

		admin(patch("/api/admin/users/" + patient.getId() + "/enabled").contentType(MediaType.APPLICATION_JSON)
				.content("{\"enabled\": false}")).andExpect(status().isOk());
		admin(patch("/api/admin/users/" + patient.getId() + "/enabled").contentType(MediaType.APPLICATION_JSON)
				.content("{\"enabled\": true}")).andExpect(status().isOk());
		admin(delete("/api/admin/users/" + patient.getId())).andExpect(status().isNoContent());

		admin(get("/api/admin/audit"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.totalElements").value(3))
				.andExpect(jsonPath("$.content[0].action").value("ACCOUNT_DELETED"))
				.andExpect(jsonPath("$.content[0].actor").value("admin@test.com"))
				.andExpect(jsonPath("$.content[0].target").value(containsString("<pat@test.com> #" + patient.getId())))
				.andExpect(jsonPath("$.content[2].action").value("ACCOUNT_DISABLED"));

		admin(get("/api/admin/audit").param("action", "ACCOUNT_ENABLED"))
				.andExpect(jsonPath("$.totalElements").value(1));
	}

	@Test
	void invitesAndAppointmentChangesAreRecorded() throws Exception {
		admin(post("/api/admin/doctors").contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(
				Map.of("email", "newdoc@test.com", "firstName", "Asha", "lastName", "Rao", "specialization", "Cardiology"))))
				.andExpect(status().isCreated());

		User doctor = create("doc@test.com", "ROLE_DOCTOR");
		Appointment a = new Appointment();
		a.setName("Test Patient");
		a.setEmail("someone@test.com");
		a.setDoctorId(doctor.getId());
		a.setDoctorName("Dr. Test User");
		a.setDate(LocalDate.now().plusDays(3).toString());
		a.setTime("10:00");
		a.setStatus(Appointment.PENDING);
		a = appointments.save(a);
		admin(patch("/api/admin/appointments/" + a.getId() + "/status").contentType(MediaType.APPLICATION_JSON)
				.content("{\"status\": \"CONFIRMED\"}")).andExpect(status().isOk());

		admin(get("/api/admin/audit"))
				.andExpect(jsonPath("$.content[0].action").value("APPOINTMENT_STATUS_CHANGED"))
				.andExpect(jsonPath("$.content[0].details").value("PENDING -> CONFIRMED"))
				.andExpect(jsonPath("$.content[1].action").value("DOCTOR_INVITED"))
				.andExpect(jsonPath("$.content[1].target").value(containsString("Asha Rao <newdoc@test.com>")))
				.andExpect(jsonPath("$.content[1].details").value("Cardiology"));

		admin(get("/api/admin/audit").param("q", "NEWDOC")).andExpect(jsonPath("$.totalElements").value(1));
	}

	@Test
	void refusedActionsLeaveNoTrace() throws Exception {
		User me = users.findByEmail("admin@test.com").orElseThrow();
		admin(delete("/api/admin/users/" + me.getId())).andExpect(status().isBadRequest());
		admin(patch("/api/admin/users/" + me.getId() + "/enabled").contentType(MediaType.APPLICATION_JSON)
				.content("{\"enabled\": false}")).andExpect(status().isBadRequest());
		assertThat(auditEvents.count()).isZero();
	}

	@Test
	void onlyAdminsCanReadItAndNobodyCanChangeIt() throws Exception {
		create("pat@test.com", "ROLE_USER");
		mockMvc.perform(get("/api/admin/audit").header("Authorization", "Bearer " + login("pat@test.com")))
				.andExpect(status().isForbidden());
		mockMvc.perform(get("/api/admin/audit")).andExpect(status().isUnauthorized());
		admin(delete("/api/admin/audit")).andExpect(status().isMethodNotAllowed());
	}

	private org.springframework.test.web.servlet.ResultActions admin(MockHttpServletRequestBuilder request) throws Exception {
		return mockMvc.perform(request.header("Authorization", "Bearer " + adminToken));
	}

	private User create(String email, String role) {
		User u = new User();
		u.setEmail(email);
		u.setFirstName("Test");
		u.setLastName("User");
		u.setRole(role);
		u.setEnabled(true);
		u.setPassword(passwordEncoder.encode(PASSWORD));
		return users.save(u);
	}

	private String login(String email) throws Exception {
		String body = mockMvc.perform(post("/api/login").contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(Map.of("username", email, "password", PASSWORD))))
				.andExpect(status().isOk())
				.andReturn().getResponse().getContentAsString();
		return objectMapper.readTree(body).get("jwt").asText();
	}
}
