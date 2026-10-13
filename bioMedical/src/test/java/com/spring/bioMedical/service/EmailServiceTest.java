package com.spring.bioMedical.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.content;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.jsonPath;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

/** How e-mails leave the app: Brevo's HTTPS API, SMTP, or only the log. */
class EmailServiceTest {

	private MockRestServiceServer brevo;
	private EmailService service;

	@BeforeEach
	void setUp() {
		RestClient.Builder builder = RestClient.builder();
		brevo = MockRestServiceServer.bindTo(builder).build();
		service = new EmailService(noSmtp(), builder);
		ReflectionTestUtils.setField(service, "fromAddress", "clinic@example.com");
		ReflectionTestUtils.setField(service, "fromName", "E-Medical");
		ReflectionTestUtils.setField(service, "smtpUsername", "");
		ReflectionTestUtils.setField(service, "brevoApiKey", "");
	}

	@Test
	void withoutAnyAccountItOnlyLogs() {
		assertThat(service.mode()).isEqualTo("log-only");
		service.sendEmail(message());
		brevo.verify(); // no HTTP call was made
	}

	@Test
	void withABrevoKeyItCallsTheHttpsApi() {
		ReflectionTestUtils.setField(service, "brevoApiKey", "test-key");
		brevo.expect(requestTo("https://api.brevo.com/v3/smtp/email"))
				.andExpect(method(HttpMethod.POST))
				.andExpect(header("api-key", "test-key"))
				.andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
				.andExpect(jsonPath("$.sender.email").value("clinic@example.com"))
				.andExpect(jsonPath("$.sender.name").value("E-Medical"))
				.andExpect(jsonPath("$.to[0].email").value("patient@example.com"))
				.andExpect(jsonPath("$.subject").value("Confirm your e-mail"))
				.andExpect(jsonPath("$.textContent").value("Click the link"))
				.andRespond(withSuccess("{\"messageId\":\"1\"}", MediaType.APPLICATION_JSON));

		assertThat(service.mode()).isEqualTo("brevo");
		service.sendEmail(message());
		brevo.verify();
	}

	@Test
	void aBrevoFailureIsLoggedNotThrown() {
		ReflectionTestUtils.setField(service, "brevoApiKey", "test-key");
		brevo.expect(requestTo("https://api.brevo.com/v3/smtp/email")).andRespond(withServerError());
		service.sendEmail(message()); // must not throw into the caller
		brevo.verify();
	}

	private static SimpleMailMessage message() {
		SimpleMailMessage m = new SimpleMailMessage();
		m.setTo("patient@example.com");
		m.setSubject("Confirm your e-mail");
		m.setText("Click the link");
		return m;
	}

	@SuppressWarnings("unchecked")
	private static ObjectProvider<JavaMailSender> noSmtp() {
		ObjectProvider<JavaMailSender> provider = org.mockito.Mockito.mock(ObjectProvider.class);
		return provider;
	}
}
