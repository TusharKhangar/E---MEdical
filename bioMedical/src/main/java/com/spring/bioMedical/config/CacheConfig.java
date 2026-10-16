package com.spring.bioMedical.config;

import java.time.Duration;
import java.util.Map;

import org.springframework.boot.autoconfigure.cache.CacheManagerCustomizer;
import org.springframework.boot.autoconfigure.cache.RedisCacheManagerBuilderCustomizer;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import com.github.benmanes.caffeine.cache.Caffeine;

/**
 * Caches for the busiest reads. In memory (Caffeine) by default; CACHE_TYPE=redis with REDIS_URL shares them
 * between app instances. Each cache has its own lifetime, and writes evict what they change (after commit).
 * Nothing that decides a booking reads a cache: the double-booking check always goes to the database under a lock.
 */
@Configuration
@EnableCaching
public class CacheConfig {

	/** Free slots for one doctor on one day. Evicted by bookings, cancellations and schedule changes. */
	public static final String SLOTS = "slots";
	/** The public doctor directory. Evicted when an admin enables, disables or deletes an account. */
	public static final String DOCTORS = "doctors";
	/** The admin analytics page. Not evicted: the numbers may be up to a minute old. */
	public static final String ANALYTICS = "analytics";

	static final Map<String, Duration> TTL = Map.of(
			SLOTS, Duration.ofSeconds(30),
			DOCTORS, Duration.ofSeconds(60),
			ANALYTICS, Duration.ofSeconds(60));

	@Bean
	public CacheManagerCustomizer<CaffeineCacheManager> caffeineCaches() {
		return manager -> TTL.forEach((name, ttl) -> manager.registerCustomCache(name,
				Caffeine.newBuilder().expireAfterWrite(ttl).maximumSize(10_000).recordStats().build()));
	}

	@Bean
	public RedisCacheManagerBuilderCustomizer redisCaches() {
		return builder -> TTL.forEach((name, ttl) -> builder.withCacheConfiguration(name,
				RedisCacheConfiguration.defaultCacheConfig().entryTtl(ttl).prefixCacheNameWith("emedical:")));
	}

	/** Evicts cache entries once the current transaction commits, so a concurrent read can't re-cache old data. */
	@Component
	public static class Evictions {

		private final CacheManager caches;

		public Evictions(CacheManager caches) {
			this.caches = caches;
		}

		public void slots(Long doctorId, String date) {
			afterCommit(() -> {
				var cache = caches.getCache(SLOTS);
				if (cache != null) {
					cache.evict(slotKey(doctorId, date));
				}
			});
		}

		/** A doctor's hours or leave changed: any of their days may differ. */
		public void allSlots() {
			clear(SLOTS);
		}

		public void doctors() {
			clear(DOCTORS);
		}

		private void clear(String name) {
			afterCommit(() -> {
				var cache = caches.getCache(name);
				if (cache != null) {
					cache.clear();
				}
			});
		}

		private static void afterCommit(Runnable action) {
			if (TransactionSynchronizationManager.isSynchronizationActive()) {
				TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
					@Override
					public void afterCommit() {
						action.run();
					}
				});
			} else {
				action.run();
			}
		}
	}

	/** Same key as the @Cacheable on AppointmentServiceImplementation.availableSlots. */
	public static String slotKey(Long doctorId, String date) {
		return doctorId + ":" + date;
	}
}
