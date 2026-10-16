package com.spring.bioMedical;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.empty;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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
import org.springframework.cache.CacheManager;
import org.springframework.data.redis.serializer.JdkSerializationRedisSerializer;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.spring.bioMedical.config.CacheConfig;
import com.spring.bioMedical.entity.User;
import com.spring.bioMedical.repository.AppointmentRepository;
import com.spring.bioMedical.repository.DoctorLeaveRepository;
import com.spring.bioMedical.repository.DoctorScheduleRepository;
import com.spring.bioMedical.repository.UserRepository;
import com.spring.bioMedical.service.AnalyticsService;
import com.spring.bioMedical.service.DirectoryService;

/** Cached reads never show something a write has just changed: each write clears what it affects. */
@SpringBootTest(properties = "spring.cache.type=caffeine")
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class CachingIntegrationTest {

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
	private DoctorScheduleRepository schedules;

	@Autowired
	private DoctorLeaveRepository leaves;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@Autowired
	private CacheManager caches;

	@Autowired
	private AnalyticsService analytics;

	@Autowired
	private DirectoryService directory;

	private User doctor;
	private final LocalDate monday = LocalDate.now().plusDays(7).with(TemporalAdjusters.nextOrSame(DayOfWeek.MONDAY));

	@BeforeEach
	void setUp() {
		appointments.deleteAll();
		schedules.deleteAll();
		leaves.deleteAll();
		users.deleteAll();
		List.of(CacheConfig.SLOTS, CacheConfig.DOCTORS, CacheConfig.ANALYTICS).forEach(name -> caches.getCache(name).clear());
		doctor = create("doc@test.com", "ROLE_DOCTOR");
		create("pat@test.com", "ROLE_USER");
		create("admin@test.com", "ROLE_ADMIN");
	}

	@Test
	void freeSlotsAreCachedAndABookingOrCancellationUpdatesThemAtOnce() throws Exception {
		mockMvc.perform(get(slots())).andExpect(jsonPath("$.slots", hasItem("10:00")));
		assertThat(caches.getCache(CacheConfig.SLOTS).get(CacheConfig.slotKey(doctor.getId(), monday.toString())))
				.as("second request is served from the cache").isNotNull();

		String patient = login("pat@test.com");
		String body = mockMvc.perform(post("/api/user/appointments").header("Authorization", "Bearer " + patient)
				.contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(Map.of("doctorId", doctor.getId(), "date", monday.toString(), "time", "10:00"))))
				.andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
		mockMvc.perform(get(slots())).andExpect(jsonPath("$.slots", not(hasItem("10:00"))));

		long id = objectMapper.readTree(body).get("id").asLong();
		mockMvc.perform(patch("/api/user/appointments/" + id + "/cancel").header("Authorization", "Bearer " + patient))
				.andExpect(status().isOk());
		mockMvc.perform(get(slots())).andExpect(jsonPath("$.slots", hasItem("10:00")));
	}

	@Test
	void aDayOffClearsTheCachedSlots() throws Exception {
		mockMvc.perform(get(slots())).andExpect(jsonPath("$.slots", not(empty())));
		mockMvc.perform(post("/api/doctor/leave").header("Authorization", "Bearer " + login("doc@test.com"))
				.contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(Map.of("date", monday.toString()))))
				.andExpect(status().isCreated());
		mockMvc.perform(get(slots())).andExpect(jsonPath("$.slots", empty()));
	}

	@Test
	void disablingADoctorRemovesThemFromTheCachedDirectory() throws Exception {
		mockMvc.perform(get("/api/doctors")).andExpect(jsonPath("$", hasSize(1)));
		mockMvc.perform(patch("/api/admin/users/" + doctor.getId() + "/enabled").header("Authorization", "Bearer " + login("admin@test.com"))
				.contentType(MediaType.APPLICATION_JSON).content("{\"enabled\": false}"))
				.andExpect(status().isOk());
		mockMvc.perform(get("/api/doctors")).andExpect(jsonPath("$", hasSize(0)));
	}

	@Test
	void analyticsIsServedFromTheCacheForAMinute() {
		AnalyticsService.Analytics first = analytics.forLastDays(30);
		assertThat(analytics.forLastDays(30)).isSameAs(first);
		assertThat(analytics.forLastDays(7)).isNotSameAs(first);
	}

	@Test
	void cachedValuesSurviveRedisSerialization() {
		JdkSerializationRedisSerializer redis = new JdkSerializationRedisSerializer();
		AnalyticsService.Analytics stats = analytics.forLastDays(30);
		assertThat(redis.deserialize(redis.serialize(stats))).isEqualTo(stats);

		var doctors = directory.activeDoctors();
		@SuppressWarnings("unchecked")
		var copy = (List<com.spring.bioMedical.dto.AdminDto>) redis.deserialize(redis.serialize(doctors));
		assertThat(copy).hasSize(1);
		assertThat(copy.get(0).getFirstName()).isEqualTo("Test");
		assertThat(copy.get(0).getEmail()).as("contact details stay private").isNull();
	}

	private String slots() {
		return "/api/doctors/" + doctor.getId() + "/slots?date=" + monday;
	}

	private User create(String email, String role) {
		User u = new User();
		u.setEmail(email);
		u.setFirstName("Test");
		u.setLastName("User");
		u.setRole(role);
		u.setEnabled(true);
		u.setSpecialization("ROLE_DOCTOR".equals(role) ? "Cardiology" : null);
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
