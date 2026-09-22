# Engagement Platform

A platform where users register, get admin-approved, learn how Reddit/LinkedIn
work, complete assigned posting/commenting tasks, and earn (Nrs.) — with
everything tracked for transparency.

Built with **Next.js (App Router) + TypeScript + Tailwind + Firebase**
(Auth email-link / Firestore / Admin SDK). Payouts are tracked as an in-app
ledger (manual payout) — coming in a later phase.

## Status: Phase 1 (auth + profile + admin approval)

Implemented so far:

- Passwordless **magic-link** sign-in (Firebase email-link).
- ID token → **httpOnly session cookie** (verified server-side).
- **Profile form** (full name, age, occupation, qualifications, skills).
- **Admin approval console** — approve/reject applicants.
- **Approval / rejection email** (logged to console in dev if no SMTP set).
- All writes go through the **server (Admin SDK)**; Firestore rules deny direct
  client access, so status/money fields stay server-controlled.

Routing after login is centralised in `lib/auth/guards.ts`:
`login → profile → pending → dashboard`, with admins sent to `/admin`.

## One-time Firebase setup

1. Create a Firebase project at <https://console.firebase.google.com>.
2. **Authentication → Sign-in method →** enable **Email/Password**, and turn on
   **Email link (passwordless sign-in)**.
3. **Authentication → Settings → Authorized domains →** add `localhost` (and
   your production domain later).
4. **Firestore Database →** create a database (production mode).
5. Deploy the rules in `firestore.rules` (or paste them in the console).
6. **Project settings → Service accounts → Generate new private key** for the
   Admin SDK env values.

## Local setup

```bash
cp .env.local.example .env.local   # then fill in the values
npm run dev
```

Open <http://localhost:3000>.

- Add your email to `ADMIN_EMAILS` to access `/admin`.
- Sign in with a non-admin email to test the applicant flow, then approve it
  from the admin console.

## Project structure

```
app/
  (auth)/login/        magic-link sign-in
  auth/callback/       completes the email link, creates the session
  post-login/          server-side router to the right page
  onboarding/profile/  profile form
  pending/ rejected/   applicant status screens
  dashboard/           approved-user home (Phase 2+ placeholders)
  admin/               approval console
  actions/             server actions (profile, admin review)
  api/auth/session/    session cookie create/clear
lib/
  firebase/            client + admin SDK init
  auth/                session + route guards
  email.ts             approval/rejection emails
  types.ts             shared types
firestore.rules        deny-all client access (server-only writes)
```

## Roadmap (next phases)

2. Platform choice (Reddit/LinkedIn) + no-skip instruction videos.
3. Projects + task submission (post/comment, category, content, **live link**).
4. Admin pricing per platform/task type + verification + Nrs. ledger + navbar
   notifications + amend/rollback.
5. Featured top performers.
