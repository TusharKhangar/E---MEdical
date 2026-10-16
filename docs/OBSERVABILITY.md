# Observability

How to see what the running app is doing: metrics for dashboards and alerts, and logs you can follow one request at a time.

## Metrics

Spring Boot Actuator with Micrometer publishes everything at `/actuator/prometheus` in Prometheus format. Every series carries `application="e-medical"`.

| Metric | What it tells you |
|---|---|
| `http_server_requests_seconds_count` / `_bucket` | Requests per endpoint, status and outcome, with latency histograms for p95 and p99 |
| `emedical_bookings_total{result}` | `booked`, `slot_taken` (someone was faster), `patient_busy` (already booked at that time) |
| `emedical_logins_total{result}` | `success`, `wrong_password`, `locked`, `not_activated`. A jump in `wrong_password` or `locked` can mean someone is guessing passwords |
| `emedical_emails_total{provider, result}` | Sent or failed, per provider (`mailjet`, `brevo`, `smtp`, `log-only`). Catches a provider that starts refusing mail |
| `emedical_appointments_pending` | Appointments waiting for a doctor to confirm |
| `hikaricp_connections_active` / `_pending` / `_max` | Database pool. `pending` above 0 means requests are queuing for a connection (see the pool stall in [PERFORMANCE.md](PERFORMANCE.md)) |
| `jvm_*`, `process_*` | Memory, garbage collection, threads, CPU |

**Who can read it:** a request with `Authorization: Bearer <METRICS_TOKEN>` (for Prometheus), or a signed-in admin. Everyone else gets 401 or 403. The token is compared in constant time. Without `METRICS_TOKEN`, only admins can read it.

The counters are recorded where things happen (`AppointmentServiceImplementation`, `LoginController`, `EmailService`), and the rest is in `config/ObservabilityConfig.java`.

## Dashboard

`observability/grafana/dashboards/e-medical.json` has 11 panels: request rate, p95 latency, 5xx error ratio, pending appointments, then per-endpoint rate and p95, bookings, sign-ins, e-mails, the database pool and JVM heap.

### Locally, with Docker

```bash
docker compose --profile observability up --build
```

- Grafana: http://localhost:3000 (admin / admin), folder E-Medical, dashboard "E-Medical"
- Prometheus: http://localhost:9090, scraping the app every 15 seconds

Use the site for a minute, or run `node tools/benchmark.mjs http://localhost:8080` after `tools/loadtest.mjs`, and the panels fill up.

### The live site

Render's free plan can't run Prometheus next to the app, so a hosted service scrapes it from outside. Grafana Cloud's free tier works:

1. In Render, open the service's **Environment** tab and copy `METRICS_TOKEN`. The blueprint generates it.
2. In Grafana Cloud, add a scrape job for a metrics endpoint: URL `https://<your-app>.onrender.com/actuator/prometheus`, authentication **Bearer**, token = `METRICS_TOKEN`.
3. In Grafana, **Dashboards → New → Import** and upload `observability/grafana/dashboards/e-medical.json`. Pick your Grafana Cloud Prometheus data source when it asks.

Each scrape is a request, so it keeps the free instance awake. Use a longer interval (a few minutes) if you'd rather let it sleep.

## Logs

- Every response has an `X-Request-Id` header. A caller can send its own id (letters, digits, `.`, `_`, `-`, at most 64 characters), and the app reuses it. Otherwise it makes a UUID.
- Every log line written while handling that request includes the id. In plain text it appears after the level, for example `INFO [3f2c...]`.
- `LOGGING_CONFIG=classpath:logback-json.xml` switches to one JSON object per line (`@timestamp`, `level`, `logger_name`, `message`, `requestId`, `stack_trace`, `application`), ready for Loki, Datadog or ELK to search by field.

To trace one complaint: ask for the `X-Request-Id` the browser received (DevTools → Network), then search the logs for it.
