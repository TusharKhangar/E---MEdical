package com.spring.bioMedical;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.SpyBean;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.transaction.support.TransactionTemplate;

import com.spring.bioMedical.entity.OutboxEmail;
import com.spring.bioMedical.repository.OutboxEmailRepository;
import com.spring.bioMedical.service.EmailService;
import com.spring.bioMedical.service.OutboxWorker;

/** The e-mail outbox: saved with the change, sent once, retried with backoff, never doubled by a race. */
@SpringBootTest(properties = { "app.mail.outbox.send-after-commit=false", "app.mail.outbox.sweep-ms=3600000" })
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class EmailOutboxIntegrationTest {

	// The real EmailService with its provider faked: sendEmail() queues, sendNow() is the provider call
	@SpyBean
	private EmailService emailService;

	@Autowired
	private OutboxWorker worker;

	@Autowired
	private OutboxEmailRepository outbox;

	@Autowired
	private TransactionTemplate tx;

	@BeforeEach
	void setUp() {
		outbox.deleteAll();
		// Pretend a real provider is configured; each test decides whether it accepts the message
		doReturn("mailjet").when(emailService).mode();
	}

	@Test
	void anEmailFromARolledBackChangeIsNeverSent() {
		tx.executeWithoutResult(status -> {
			emailService.sendEmail(message("kept@test.com"));
		});
		tx.executeWithoutResult(status -> {
			emailService.sendEmail(message("rolled-back@test.com"));
			status.setRollbackOnly();
		});
		assertThat(outbox.findAll()).extracting(OutboxEmail::getRecipients).containsExactly("kept@test.com");
	}

	@Test
	void sentOnceAndMarkedSent() {
		doReturn(Optional.empty()).when(emailService).sendNow(any());
		emailService.sendEmail(message("pat@test.com"));

		assertThat(worker.sendDue()).isEqualTo(1);
		assertThat(worker.sendDue()).isZero();

		OutboxEmail m = outbox.findAll().get(0);
		assertThat(m.getStatus()).isEqualTo(OutboxEmail.SENT);
		assertThat(m.getAttempts()).isEqualTo(1);
		assertThat(m.getSentAt()).isNotNull();
		verify(emailService, times(1)).sendNow(any());
	}

	@Test
	void aFailureIsRetriedLaterThenSucceeds() {
		doReturn(Optional.of("Mailjet refused the message (503)")).when(emailService).sendNow(any());
		emailService.sendEmail(message("pat@test.com"));

		worker.sendDue();
		OutboxEmail m = outbox.findAll().get(0);
		assertThat(m.getStatus()).isEqualTo(OutboxEmail.PENDING);
		assertThat(m.getAttempts()).isEqualTo(1);
		assertThat(m.getLastError()).contains("503");
		assertThat(m.getNextAttemptAt()).isAfter(LocalDateTime.now().plusSeconds(50)); // first retry after a minute

		assertThat(worker.sendDue()).as("not due yet").isZero();

		// A minute later the provider is back
		m.setNextAttemptAt(LocalDateTime.now().minusSeconds(1));
		outbox.save(m);
		doReturn(Optional.empty()).when(emailService).sendNow(any());
		worker.sendDue();
		m = outbox.findById(m.getId()).orElseThrow();
		assertThat(m.getStatus()).isEqualTo(OutboxEmail.SENT);
		assertThat(m.getAttempts()).isEqualTo(2);
		assertThat(m.getLastError()).isNull();
	}

	@Test
	void givesUpAfterTheLastRetry() {
		doReturn(Optional.of("Could not reach Mailjet")).when(emailService).sendNow(any());
		emailService.sendEmail(message("pat@test.com"));
		for (int i = 0; i < 10; i++) {
			outbox.findAll().forEach(m -> {
				m.setNextAttemptAt(LocalDateTime.now().minusSeconds(1));
				outbox.save(m);
			});
			worker.sendDue();
		}
		OutboxEmail m = outbox.findAll().get(0);
		assertThat(m.getStatus()).isEqualTo(OutboxEmail.FAILED);
		assertThat(m.getAttempts()).isEqualTo(6);
		verify(emailService, times(6)).sendNow(any());
	}

	@Test
	void twoWorkersAtOnceSendEachEmailExactlyOnce() throws Exception {
		// Mockito stubs aren't safe to call from several threads, so this test uses the real log-only sender
		Mockito.reset(emailService);
		for (int i = 0; i < 30; i++) {
			emailService.sendEmail(message("p" + i + "@test.com"));
		}
		ExecutorService pool = Executors.newFixedThreadPool(4);
		CountDownLatch start = new CountDownLatch(1);
		List<Future<Integer>> results = new ArrayList<>();
		for (int i = 0; i < 4; i++) {
			results.add(pool.submit(() -> {
				start.await();
				return worker.sendDue();
			}));
		}
		start.countDown();
		int total = 0;
		for (Future<Integer> r : results) {
			total += r.get();
		}
		pool.shutdown();

		assertThat(total).isEqualTo(30);
		assertThat(outbox.countByStatus(OutboxEmail.LOGGED)).isEqualTo(30);
		verify(emailService, times(30)).sendNow(any());
	}

	@Test
	void aWorkerThatDiedMidSendIsPickedUpAgain() {
		doReturn(Optional.empty()).when(emailService).sendNow(any());
		emailService.sendEmail(message("pat@test.com"));
		OutboxEmail m = outbox.findAll().get(0);
		m.setStatus(OutboxEmail.SENDING);
		m.setClaimedAt(LocalDateTime.now().minusMinutes(15));
		outbox.save(m);

		worker.sweep();
		assertThat(outbox.findById(m.getId()).orElseThrow().getStatus()).isEqualTo(OutboxEmail.SENT);
	}

	private static SimpleMailMessage message(String to) {
		SimpleMailMessage m = new SimpleMailMessage();
		m.setTo(to);
		m.setSubject("Appointment request received");
		m.setText("Hello");
		return m;
	}
}
