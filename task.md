# TOTP migration
Responsive follow-up: popup viewport metadata added; iframe uses 100vw/100dvh.
Verified real embedded site at 390x844, 844x390, 1440x900 and 1024x768. Both outer
and inner documents match the viewport width with no horizontal overflow. Build
and lint pass. Authentication/secret/cookies unchanged; publish via platform UI.
Latest change: destination is https://alli-tube.runable.site/, rendered in a
full-viewport iframe inside a new about:blank tab. Real target iframe loaded in
browser testing; outer URL stays about:blank. Cookie restore uses the same button
flow and blocked-popup fallback. Builds/lint pass; public update is still via UI.

- Replace HHmm binary/year password with OTPAuth TOTP: SHA1, six digits, 30 seconds.
- Generate a 160-bit secret in root .env. Never serve enrollment QR/secret publicly.
- Deliver private enrollment QR and manual import data separately in chat.
- Keep existing signed HttpOnly 400-day cookies and current destination.
- Persist singleton attempt count, five-minute global lock after five failures,
  and last accepted TOTP counter. Atomic DB transaction prevents replay races.
- Keep generic login copy/no hints; input accepts exactly six decimal digits.
- Verify RFC vectors, invalid/expired/reused codes, lockout, cookie persistence,
  secret not in client build/assets, QR consistency and mobile layout.
- No accounts or new identity providers; one existing shared portal authenticator.

Progress: complete.
Public-release status: on inspection, https://school-portal.runable.site still
serves the old 32-character input and accepts the legacy binary password. The
local preview rejects legacy codes and accepts independent TOTP. Publishing is
platform-controlled; user must republish the updated existing artifact.
- Clarified the updated login field label as "6桁の認証コード". No key rotation.
- OTPAuth installed and root secret generated without logging it.
- Enrollment PNG/manual key saved outside the app under portal-auth-private.
- Database schema pushed; isolated tests cover RFC vectors, expiry, replay,
  malformed codes, lockout, concurrency, secure cookies and RPC integration.
- Browser verified independent Python-generated code, wrong-code rejection,
  new tab, cookie restore, mobile layout and absence of secret/public QR assets.
- Existing cookies preserved; user still needs to register the delivered QR.
- Per-process queue avoids competing SQLite writes; DB transactions remain
  durable cross-process enforcement. Infrastructure DB failures fail closed.