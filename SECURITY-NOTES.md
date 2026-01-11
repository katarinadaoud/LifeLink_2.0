# Backend Security Notes

This file summarizes backend-only security measures added without frontend changes.

- Auth & Tokens:
  - ASP.NET Identity lockout enabled 
  - JWT access tokens reduced to 30 minutes (no refresh flow).
  - HTTPS required for token metadata outside development.
- Authorization:
  - Controllers protected with `[Authorize]`.
  - Role gates:
    - Patients listing endpoint restricted to `Employee`.
    - Employees listing endpoint accessible to `Employee` and `Patient` (patients need provider list for appointments).
  - Ownership checks: patients can access only their own resources.
- Rate Limiting:
  - Fixed window limiter for `POST /api/Auth/login` (5/min per IP).
  - Fixed window limiter for `POST /api/Auth/register` (3/min per IP).
- Errors:
  - Global exception handler with ProblemDetails; no stack traces in prod.
- Logging:
  - Removed claim/PII dumps; kept high-level audit logs.
- CORS:
  - Dev: localhost origins.
  - Prod: allowlist from configuration (`Cors:AllowedOrigins`).
- CSP:
  - Basic self-only policy via response headers in production.

To adjust production allowlist, set `Cors:AllowedOrigins` in `api/appsettings.Production.json` to a comma-separated list of domains.
