package com.spring.bioMedical.service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.PageRequest;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.transaction.support.TransactionTemplate;

import com.spring.bioMedical.entity.OutboxEmail;
import com.spring.bioMedical.repository.OutboxEmailRepository;

/**
 * Queues e-mails in the outbox table and sends them. A new e-mail is sent as soon as its transaction commits;
 * a sweep every {@code app.mail.outbox.sweep-ms} picks up retries and anything missed (for example after a
 * restart). Delivery is at-least-once: a crash between "provider accepted it" and "marked sent" can resend.
 */
@Service
public class OutboxWorker {

	private static final Logger logger = LoggerFactory.getLogger(OutboxWorker.class);

	/** Wait before attempt 2, 3, ... After the last one fails the e-mail is FAILED (6 attempts over ~15 hours). */
	static final List<Duration> BACKOFF = List.of(Duration.ofMinutes(1), Duration.ofMinutes(5), Duration.ofMinutes(30),
			Duration.ofHours(2), Duration.ofHours(12));

	private final OutboxEmailRepository outbox;
	private final EmailService emailService;
	private final TransactionTemplate tx;

	// The proxied bean, so @Async applies when enqueue() calls sendSoon() on this class
	@Autowired
	@Lazy
	private OutboxWorker self;

	@Value("${app.mail.outbox.batch:50}")
	private int batch;

	// Tests turn this off to drive the queue by hand; the sweep still runs
	@Value("${app.mail.outbox.send-after-commit:true}")
	private boolean sendAfterCommit;

	public OutboxWorker(OutboxEmailRepository outbox, @Lazy EmailService emailService, TransactionTemplate tx) {
		this.outbox = outbox;
		this.emailService = emailService;
		this.tx = tx;
	}

	/** Saves the e-mail in the caller's transaction (or its own if there is none) and sends it after commit. */
	public void enqueue(SimpleMailMessage email) {
		LocalDateTime now = now();
		OutboxEmail m = new OutboxEmail();
		m.setRecipients(String.join(",", email.getTo()));
		m.setSubject(email.getSubject());
		m.setBody(email.getText());
		m.setCreatedAt(now);
		m.setNextAttemptAt(now);
		outbox.save(m);
		if (!sendAfterCommit) {
			return;
		}
		if (TransactionSynchronizationManager.isSynchronizationActive()) {
			TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
				@Override
				public void afterCommit() {
					self.sendSoon();
				}
			});
		} else {
			self.sendSoon();
		}
	}

	/** Runs the queue on the async pool, so the request that queued the e-mail doesn't wait for the provider. */
	@Async
	public void sendSoon() {
		sendDue();
	}

	/** Retries, and anything not sent right away. */
	@Scheduled(fixedDelayString = "${app.mail.outbox.sweep-ms:30000}", initialDelayString = "${app.mail.outbox.sweep-ms:30000}")
	public void sweep() {
		Integer released = tx.execute(s -> outbox.releaseStuck(now().minusMinutes(10)));
		if (released != null && released > 0) {
			logger.warn("Put {} e-mail(s) back in the queue after a worker stopped mid-send", released);
		}
		sendDue();
	}

	/** Sent mail is deleted after 7 days: it contains sign-up and password-reset links. */
	@Scheduled(cron = "${app.mail.outbox.purge-cron:0 30 3 * * *}")
	public void purge() {
		tx.execute(s -> outbox.purgeDelivered(now().minusDays(7)));
	}

	/** Sends everything that is due now. Returns how many e-mails this call handled. */
	public int sendDue() {
		int handled = 0;
		List<Long> due;
		do {
			due = outbox.findDue(now(), PageRequest.of(0, batch));
			for (Long id : due) {
				if (sendOne(id)) {
					handled++;
				}
			}
		} while (due.size() == batch);
		return handled;
	}

	private boolean sendOne(Long id) {
		Integer claimed = tx.execute(s -> outbox.claim(id, now()));
		if (claimed == null || claimed == 0) {
			return false; // another worker has it
		}
		OutboxEmail m = outbox.findById(id).orElseThrow();
		boolean logOnly = "log-only".equals(emailService.mode());
		// The provider call runs outside any transaction, so no database connection waits on the network
		Optional<String> error = emailService.sendNow(toMessage(m));
		tx.executeWithoutResult(s -> outbox.save(afterAttempt(m, logOnly, error, now())));
		return true;
	}

	/** What the row looks like after one attempt. */
	static OutboxEmail afterAttempt(OutboxEmail m, boolean logOnly, Optional<String> error, LocalDateTime now) {
		m.setAttempts(m.getAttempts() + 1);
		m.setClaimedAt(null);
		if (logOnly) {
			m.setStatus(OutboxEmail.LOGGED);
		} else if (error.isEmpty()) {
			m.setStatus(OutboxEmail.SENT);
			m.setSentAt(now);
			m.setLastError(null);
		} else {
			String reason = error.get();
			m.setLastError(reason.length() > 500 ? reason.substring(0, 500) : reason);
			if (m.getAttempts() > BACKOFF.size()) {
				m.setStatus(OutboxEmail.FAILED);
				logger.error("Gave up on e-mail #{} to {} after {} attempts: {}", m.getId(), m.getRecipients(),
						m.getAttempts(), reason);
			} else {
				m.setStatus(OutboxEmail.PENDING);
				m.setNextAttemptAt(now.plus(BACKOFF.get(m.getAttempts() - 1)));
				logger.warn("E-mail #{} to {} failed (attempt {}), next try at {}: {}", m.getId(), m.getRecipients(),
						m.getAttempts(), m.getNextAttemptAt().withNano(0), reason);
			}
		}
		return m;
	}

	private static SimpleMailMessage toMessage(OutboxEmail m) {
		SimpleMailMessage message = new SimpleMailMessage();
		message.setTo(m.getRecipients().split(","));
		message.setSubject(m.getSubject());
		message.setText(m.getBody());
		return message;
	}

	/**
	 * The clock, cut to milliseconds. Databases keep microseconds and round the rest, so a full-precision time
	 * could be stored slightly later than "now" a moment after, and a just-queued e-mail would not look due yet.
	 */
	private static LocalDateTime now() {
		return LocalDateTime.now().truncatedTo(ChronoUnit.MILLIS);
	}
}
