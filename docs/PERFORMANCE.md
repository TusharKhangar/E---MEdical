# Performance

How fast the busiest endpoints are, what made them faster, and two concurrency bugs that only showed up under load.

## Setup

- **Machine:** laptop, Intel Core i5-11260H (6 cores), 16 GB RAM, Windows 11. App and database on the same machine.
- **Stack:** the production jar (Spring Boot 3, Java 21) on MySQL 8, connection pool of 20.
- **Data:** `tools/loadtest.mjs` creates 120 doctors and 1,500 patients through the public API (sign-up, e-mailed link, password) and books 6,000 appointments. `tools/history.sql` then copies them 40 times as past visits, giving **193,561 appointments**, about a year of a busy clinic.
- **Load:** `tools/benchmark.mjs` runs 16 concurrent clients against each endpoint for 15 seconds, after a warm-up, and reports requests per second and latency percentiles. No errors in any run.

## Results: before and after the indexes

| Endpoint | req/s before | req/s after | p95 before | p95 after | Throughput |
|---|---:|---:|---:|---:|---:|
| Public: free slots for a doctor | 59 | 1,114 | 338 ms | 25 ms | 19x |
| Patient: own appointments | 36 | 1,497 | 525 ms | 19 ms | 42x |
| Doctor: own appointments (~1,600 rows) | 37 | 375 | 538 ms | 57 ms | 10x |
| Admin: search pending, page 1 | 22 | 186 | 885 ms | 174 ms | 8.5x |
| Admin: search by doctor and dates | 23 | 2,685 | 837 ms | 8 ms | 115x |
| Admin: analytics, last 30 days | 10 | 16 | 1,993 ms | 1,282 ms | 1.7x |
| Admin: doctor accounts, page 1 | 1,371 | 2,501 | 16 ms | 9 ms | 1.8x |

Before, every appointment query read the whole 194k-row table. The indexes match the queries:

| Index | Serves |
|---|---|
| `appointment (doctor_id, date, time)` | free slots, the double-booking check, a doctor's list, search by doctor |
| `appointment (email, date)` | a patient's list, the "already booked at this time" check |
| `appointment (status, date)` | the admin's status filter |
| `appointment (date)` | analytics date ranges, the day-before reminder job |
| `user (authority)` | account lists by role |

They are declared on the entities (`@Table(indexes = ...)`), so Hibernate creates them on existing databases at start-up. Nothing to run by hand.

**Still slow:** analytics runs six aggregate queries over every appointment in the range. An index can't shrink that much work. Caching the result for a minute fits better, because the numbers don't need to be live to the second.

## Results: caching

Same data and load, comparing the build with indexes against the build with caches too (Caffeine, in memory):

| Endpoint | req/s before | req/s after | p95 before | p95 after |
|---|---:|---:|---:|---:|
| Admin: analytics, last 30 days | 17 | 4,768 | 1,071 ms | 5 ms |
| Public: doctor directory | 1,904 | 4,216 | 15 ms | 8 ms |
| Public: free slots for a doctor | 2,000 | 3,736 | 14 ms | 8 ms |
| Endpoints without a cache | about the same | | | |

What is cached and why it stays correct:

| Cache | Lifetime | Cleared when |
|---|---|---|
| Free slots per doctor and day | 30 s | that day gets a booking, a cancellation, a reschedule or a status change; any change to the doctor's hours or days off |
| Public doctor directory | 60 s | an admin enables, disables or deletes an account; an invited doctor sets their password; a doctor edits their profile |
| Admin analytics per range | 60 s | any appointment is booked, moved or changes status |

- The benchmark only reads, so it shows the cache at its best. Under real use each booking clears that day's slots and the analytics, and the next read rebuilds them.
- Caches are cleared **after the transaction commits**. Clearing before commit would let a concurrent read put the old value straight back.
- **Nothing that decides a booking reads a cache.** The double-booking check always queries the database under a row lock, so a stale slot list can at worst offer a slot that was just taken, and booking it gets a clear "slot already booked" reply.
- Hit and miss counts are in Prometheus (`cache_gets_total{cache, result}`) and on the Grafana dashboard.
- It also keeps revisiting the same 120 doctor-days. Real traffic spreads over more days and hits the slot cache less often.
- `CACHE_TYPE=redis` with `REDIS_URL` moves the caches to Redis, so several app instances share them and evictions reach all of them. Values are Java-serialized, and a test checks every cached type survives that. Running against a live Redis server is not tested here: no Redis on this machine.

## Bugs the load test found

### 1. Double bookings on MySQL (fixed)

With 20 patients booking the same slot at once, MySQL accepted **19** of them. One patient booking 5 doctors at the same time got all 5.

The booking code locks the doctor's and the patient's rows (`SELECT ... FOR UPDATE`), then checks whether the slot is free. On MySQL's default isolation level, REPEATABLE READ, a transaction keeps reading the snapshot taken at its first read. That read happened before it waited for the lock, so after the wait it still didn't see the booking that had just been committed.

Fix: `book()` and `reschedule()` now run in READ COMMITTED, so the check after the lock reads committed data. After the fix the same test gives 1 booking and 19 "slot taken" replies.

The live site runs on PostgreSQL, whose default is already READ COMMITTED, so it was never affected. The unit tests run on H2, which behaves the same way, which is why they passed. Only a real load test on MySQL showed it.

### 2. Connection-pool stall on MySQL (known, not fixed)

With the default pool of 5 and 8 or more concurrent sign-ups or bookings, every request stalled for 30 seconds and then failed with "Connection is not available".

MySQL has no sequences, so Hibernate hands out IDs from a table (`appointment_seq`, `user_seq`) and fetches each new block of IDs on a **second** connection. When every connection is held by a request waiting for that ID block, the request that fetches it can't get a connection: a deadlock until the pool times out.

PostgreSQL (production) uses real sequences on the same connection, so it isn't affected. On MySQL, set `DB_POOL_SIZE` above the expected number of concurrent writes. The real fix is `IDENTITY` IDs on MySQL, but that changes existing tables, so it waits for a proper migration tool (Flyway).

## Run it yourself

Use a local, empty database: the load test creates thousands of accounts. Start the app with e-mail switched off (no `MAIL_*`, `BREVO_*` or `MAILJET_*` settings, and not from a folder with your `.env`), then:

```bash
ADMIN_EMAIL=admin@load.test ADMIN_PASSWORD='Load-Test-Admin-1!' LOGGING_FILE_NAME=load.log java -jar bioMedical.jar
APP_LOG=load.log node tools/loadtest.mjs http://localhost:8080   # fill the database, check the races
mysql -u root emedical_load < tools/history.sql                   # optional: a year of history (MySQL)
node tools/benchmark.mjs http://localhost:8080                    # throughput and latency
```
