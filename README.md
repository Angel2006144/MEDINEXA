# MEDINEXA — Connecting Care, Empowering Health
Next.js 14 + TypeScript + Tailwind + Prisma/PostgreSQL. All seeded data is **sample/demo**, not verified.

## Run locally
```bash
npm install
cp .env.example .env        # fill DATABASE_URL (local Postgres, Neon or Supabase)
npx prisma migrate dev --name init   # already migrated? run: npx prisma migrate dev --name add_booking
npm run seed
npm run dev                 # http://localhost:3000
```
## Included
- **Public:** `/` landing (cursor glow, neon hero) · `/about` · `/hospitals` (search, department, 24/7 filters) · `/hospitals/[slug]` (facilities, services, departments→doctors, reviews, own Google map, booking) · `/doctors`, `/doctors/[id]` · `/map`
- **Auth (demo-grade):** `/login`, `/dashboard`, signed HttpOnly cookie sessions, scrypt password hashes. Roles are stored; role-based admin screens are not built yet.
- **Chat:** `/chat` with persisted messages; replies are a clearly labelled **demo responder** (`app/api/chat/route.ts` is where real-time delivery plugs in).
- **Booking:** doctor or service appointments, `/booking/[reference]`.
- **Scanner:** `/scanner` prescription upload/camera → OCR → standardized English (`lib/ocr.ts`, needs `OPENAI_API_KEY`), and live QR scanning → `POST /api/qr/resolve`. The seed prints QR tokens; encode them in any QR generator (the QR may contain just the token or a URL ending in it).
- **Demo login:** `patient@medinexa.demo` / `demo1234` (created by `npm run seed`; change/remove before production).

## Also included
Registration (`/register`), dashboard shell with sidebar (`/dashboard/*`), saved hospitals, review submission (login required, rate-limited), departments and facilities pages, role screens: **Hospital Admin / Super Admin** `/dashboard/manage` (edit hospital info, update appointment status, moderate reviews) and **Doctor** `/dashboard/doctor` (availability, appointments, chat replies). Demo logins (password `demo1234`): `patient@`, `hospital@`, `doctor@`, `admin@medinexa.demo`. Run `npx prisma migrate dev --name add_roles` after pulling this version.

## Known gaps
Password reset/email verification, notifications, admin CRUD for doctors/departments/facilities, cloud storage + history for prescriptions, Redis rate limiting (current limiter is per-instance), real-time chat transport, doctor photos, dark/light toggle, automated tests.

## Deploy to Vercel
Push to GitHub, import in Vercel, set env vars from `.env.example` (strong `NEXTAUTH_SECRET`), use managed Postgres, run `npx prisma migrate deploy`, then `npm run seed` once and delete the demo users.
