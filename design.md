## 学習支援ポータルサイト — implementation direction
Responsive popup: add width=device-width/initial-scale=1 viewport metadata to
the about:blank document before mounting. Iframe fills 100vw by 100dvh, adapting
to desktop resizing, phone orientation and changing mobile browser height.
Do not force a 16:9 page ratio, transform-scale the page or disable pinch zoom.
The remote iframe's internal layout remains controlled by the remote site.
Destination update: open a new about:blank tab with a full-viewport React iframe
for https://alli-tube.runable.site/. Never navigate the outer tab to the target.
The success button uses the same popup flow, including popup-blocking fallback.
Keep TOTP, cookie persistence, existing branding and secret unchanged.
Authentication update: standard server-only TOTP replaces the old time/binary
password. SHA1, six digits, 30-second step, one-step clock tolerance. Keep the
generic password label and green styling without enrollment instructions in UI.
Registration QR and key are private chat artifacts, never public web assets.
Persist five-failure/five-minute shared-gate lockout and used-code counters.
Keep existing cookies and success screen. No enrollment endpoint or new accounts.
Latest revision: replace every visible YouTube label, including success messages
and buttons, with 学習支援ポータルサイト. Replace all red accents with Classroom
green #1da362 (hover/error text #188f59). Keep the destination URL unchanged.
Buttons must accommodate the longer Japanese labels without clipping on mobile.
Brand update: use the provided Classroom image for the header logo, favicon,
Apple touch icon, and social preview. Site title is 学習支援ポータルサイト.
Keep the actual YouTube destination and existing authentication/cookie behavior.
On small screens, wrap the Japanese site name and hide the secondary header label.
Persistent access: a signed, HttpOnly browser cookie remembers successful gate
authentication for 400 days. Revisit checks the signature and expiry on the server
and renders success without a password form or automatic popup. No new accounts
or sign-in methods. Secure HTTPS cookies support partitioned embedded previews.
Revision: all visible password hints are prohibited, including binary digits,
time-based wording, minute changes, time zone information, and error-message hints.
Use generic access copy only. Remove the success-screen reset control and brand
home link. The former binary-time/year password is no longer accepted.
Minimal Japanese password gate. Off-white #f7f7f5 canvas, white surface,
near-black #171717 text, Classroom green #1da362 as the single accent.
Poppins paired with Noto Sans JP and system sans-serif fallback. Centered,
quiet editorial layout with generous negative space, a slim top navigation,
large Japanese heading, one compact form, and a small technical footer.
8px spacing scale; 12px field radius; thin neutral borders. No photography.
Use lucide line icons; the provided Classroom image identifies the portal.
Responsive single column, accessible labels and live errors, visible focus,
password visibility toggle, pending state, success state and blocked-popup fallback.
The TOTP code is never generated on the client. Server verifies a six-digit
SHA1 TOTP with 30-second steps, one-step drift tolerance and replay prevention.
No accounts; portal_gate_state persists failures, lockout and last used step.
oRPC gate.verify and gate.session provide verification and cookie restoration.

# <App Name> — Design

> Starter design brief. Replace this content with the app you're building before writing any UI.
> Keep it short and concrete — it's the single source of truth for palette, typography, pages,
> screens, and flows across web, mobile, and desktop.

One-line description of the app, the platforms it ships on, the visual direction (style, feel), and the core job it does for the user.

## Brand & Colors

One token set, consumed per platform:

- **Web & desktop**: CSS variables in `packages/web/src/web/styles.css` (desktop loads the web UI).
- **Mobile**: `Colors.light` / `Colors.dark` in `packages/mobile/constants/theme.ts`, read via `useColors()`; `userInterfaceStyle: "automatic"` follows the system light/dark setting.

| Token | Light | Dark | Use |
|-------|-------|------|-----|
| primary | #1F1F1F | #E5E5E5 | Buttons, active tab, accents |
| background | #FFFFFF | #0A0A0A | Page/screen background |
| card | #FFFFFF | #1A1A1A | Cards, surfaces |
| foreground | #171717 | #FAFAFA | Primary text |
| mutedForeground | #737373 | #A3A3A3 | Secondary text |
| border | #E5E5E5 | #262626 | Hairlines |
| destructive | #DC2626 | #EF4444 | Delete / errors |

## Typography

Name the display + body pairing here. Web: set font families in `styles.css` (self-hosted files go in `packages/web/public/fonts/`). Mobile: system font by default; load custom fonts with `useFonts` from `expo-font` and reference them via `Fonts` in `constants/theme.ts`.

## Pages & Screens

List each page/screen, its route file, and what it shows. Example:

- **Web — Home** (`packages/web/src/web/pages/index.tsx`) — what the user sees first.
- **Mobile — Home** (`packages/mobile/app/(tabs)/index.tsx`) — main tab.
- Add web pages under `src/web/pages/` (+ route in `app.tsx`); mobile tabs under `app/(tabs)/`, stack/modal screens under `app/`.

## Key User Flows

1. Describe the primary flow end to end (open → action → result).
2. ...

## Architecture

- **API**: typed oRPC client (`lib/api.ts` in each package) → the backend in `@template/web`. Query/mutation hooks live in `queries/` (one file per feature); pages/screens call them with `@tanstack/react-query`.
- **State/sync**: TanStack Query with optimistic updates for instant-feel interactions.
- **Auth / payments / uploads**: see `skills/app/references/` when those features are needed.
