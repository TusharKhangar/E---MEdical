# Interview review: E-Medical System

**Reviewer stance:** hiring a backend/full-stack engineer with about 2 years of experience.
**What I tested (2026-10-13):** the live site at https://e-medical-224w.onrender.com: 40 scripted API checks (auth, tokens, roles, ownership, validation, platform), every public page, all three dashboards on desktop and on a phone-size screen, plus a read of the code.

> **Update, same day:** findings 1 to 10 and 12 are fixed (see the table at the end); 11 (pagination) and the
> race on simultaneous bookings remain good interview talking points.

## Verdict

**Would advance to the next round: yes, leaning hire.** It's a real deployed full-stack app with security that holds up under poking, sensible business rules, and tests. That already puts it ahead of most 2-year portfolios, which are usually CRUD tutorials. What keeps it from a strong hire today: the demo can't be fully tried (sign-up dead-ends on the live site), the dashboard breaks on phones, a few 500s, and some code-level signals of a project that grew by patching.

## What impressed me

| Area | Evidence from testing |
| --- | --- |
| Auth is solid | Forged JWT payload, `alg=none` token and garbage tokens are all rejected with 401. Wrong password and unknown user return the same message (no user enumeration). Login is case-insensitive on e-mail. |
| Role enforcement | Patient → admin/doctor endpoints: 403. Doctor/admin → booking: 403. No gaps found. |
| Ownership (IDOR) | A doctor changing another doctor's appointment gets 404, not 200. A patient can't cancel someone else's booking. An admin can't disable their own account. Sending `role: ROLE_ADMIN` in a profile update is ignored. |
| Business rules | Past dates, lunch slot, more than 90 days ahead, malformed dates, over-long text, double-booking a doctor's slot, invalid status transitions: all rejected with clear 400/409 messages. |
| Privacy | Public doctor list hides e-mail and phone. Password hashes and tokens never appear in responses. Forgot-password gives the same answer for unknown e-mails. |
| Delivery | Docker multi-stage image, CI on every push (tests, lint, build, image), Render blueprint, health check, README with screenshots. |
| Performance | Warm API calls 250 to 380 ms from India to the Render region; JS bundle 465 KB (fine). |

## What would cost points in an interview

### Things I hit as a user (fix first: an interviewer will click these)

1. **Sign-up can't be completed on the live site.** No mail account is configured on Render, so the confirmation e-mail is only written to the server log. An interviewer who registers is stuck forever. Same for forgot password.
2. **Dashboard is unusable on a phone.** The fixed 256 px sidebar takes about 60 % of a 375 px screen and the content is squashed. The public pages are fine on mobile.
3. **Marketing pages don't match the data.** Home claims "50+ doctors, 500+ patients" (there are 5 and 2); Departments lists Dental, Diagnostic and Emergency, which have no doctors; the Contact form's "Send Message" does nothing; "Learn More" and "Read Full Article" go nowhere.

### Bugs found by the API probe

4. **500 on registration with blank names** (`"firstName": "   "`): `@NotEmpty` lets whitespace through. Should be `@NotBlank` → 400.
5. **500 on any unknown `/api/...` path** instead of 404: the catch-all exception handler swallows Spring's "no handler" exception.
6. **A patient can book two doctors at the same time.** Slot conflicts are checked per doctor, not per patient.
7. **Three different error formats:** plain text for business errors, a JSON body for 401, Spring's default JSON for 403. A frontend dev or API consumer has to handle all three.

### Missing things an interviewer will ask about

8. **No brute-force protection on login:** 12 rapid wrong passwords, 12 × 401, no lockout or 429.
9. **No API documentation:** no Swagger/OpenAPI page. Easy win that interviewers love to click.
10. **Missing security headers:** no `Content-Security-Policy`, no `Referrer-Policy` (HSTS, nosniff and frame options are there).
11. **No pagination** on admin lists; fine at demo scale, but expect the "what happens with 100k appointments?" question.
12. **No frontend tests** (0 test files) even though Vitest is installed.

### Code-review notes (what I'd ask you to explain)

- **Field injection** (`@Autowired` on fields) in 10 classes alongside constructor injection elsewhere. Pick constructor injection everywhere.
- **Naming and layering:** `AdminServiceImplementation` implements an `AdminService` interface nobody uses, and it's actually a user service; `AppointmentServiceImplementation` has no interface at all. `UserService` and `AdminServiceImplementation` both wrap the same table.
- **Dates and times stored as strings** (`date`, `time`, `regtime`). Works, but `LocalDate`/`LocalTime` columns would let the database sort and range-query correctly.
- **`ddl-auto=update` in production** instead of Flyway/Liquibase migrations. Be ready to explain the trade-off.
- **Deprecated JJWT API** (`setSubject`, `parseClaimsJws`, `setSigningKey`) and one `System.err.println` in `JwtUtil`.
- **JWT kept in `localStorage`** with no refresh token. Common, but know the XSS trade-off versus HttpOnly cookies.
- **Lombok `@Data` on JPA entities** (generates `equals`/`hashCode` over all fields); prefer `@Getter`/`@Setter`.

## Questions I'd ask you in the interview

1. Walk me through what happens, filter by filter, when a request with a JWT hits `/api/admin/stats`.
2. Two patients click the same slot at the same millisecond. What does your code do? (Hint: the check-then-insert has a race; a unique constraint on doctor + date + time for active bookings closes it.)
3. Why does a forged token fail but a stolen token works for 24 hours? How would you add logout or revocation?
4. Why plain text errors? How would you design an error contract for a mobile client?
5. How would you move from `ddl-auto=update` to versioned migrations without losing production data?
6. The free host sleeps. How would you make the first request fast, and what would you monitor?

## Score

| Dimension | Score /5 | Note |
| --- | --- | --- |
| Functionality | 4 | All core flows work; sign-up dead-ends on the live demo |
| Security | 4 | Strong JWT and authorization; missing rate limit and CSP |
| Code quality | 3 | Readable, but mixed injection styles and naming from patching |
| Testing | 3.5 | 19 good backend tests; no frontend tests |
| UX / UI | 3 | Polished on desktop; dashboard broken on mobile; placeholder marketing content |
| DevOps | 4.5 | Docker, CI, IaC blueprint, health checks |
| **Overall** | **3.7** | Above the bar for 2 YOE; fixing items 1 to 9 makes it a 4.3+ |

## What was fixed after this review

| # | Finding | Fix | Verified by |
| --- | --- | --- | --- |
| 1 | Sign-up dead-ends on the live site | Demo mode returns the e-mailed link and the UI shows a button to it; shared demo accounts are protected | `DemoModeIntegrationTest`, clicked through register → confirm → set password → sign in |
| 2 | Dashboard unusable on phones | Off-canvas sidebar with a menu button below the `md` breakpoint; responsive card grids | Checked at 375 px: no horizontal scroll, drawer opens and closes on navigation |
| 3 | Fake marketing numbers, dead links, Contact form did nothing | Home numbers and departments come from the database; links go to filtered doctor lists; Contact form saves to an admin inbox | `HardeningIntegrationTest`, clicked through |
| 4 | 500 on blank names | `@NotBlank` + handler for entity validation → 400 | `HardeningIntegrationTest` |
| 5 | 500 on unknown `/api` path | 404 handler | `HardeningIntegrationTest` |
| 6 | Patient booked twice at once | HQL check per patient → 409 | `HardeningIntegrationTest` |
| 7 | Three error formats | 401 and 403 are plain text like every other error | `HardeningIntegrationTest` |
| 8 | No brute-force protection | 5 failures lock the e-mail for 15 minutes (429) | `LoginAttemptServiceTest`, `HardeningIntegrationTest` |
| 9 | No API docs | Swagger UI at `/swagger-ui.html` with bearer auth | `HardeningIntegrationTest`, opened in browser |
| 10 | Missing security headers | CSP, Referrer-Policy, Permissions-Policy | `HardeningIntegrationTest`; removed a third-party font the CSP blocked |
| 12 | No frontend tests | 13 Vitest + Testing Library tests, run in CI | `npm test` |
| — | Code-review notes | Constructor injection everywhere, current JJWT API, dead code removed | Build and all tests |

Also found and fixed while testing: registering or logging in flashed a full-page spinner that unmounted the form mid-request.
