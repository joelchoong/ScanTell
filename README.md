# ScanTell

A Next.js 14 boilerplate with authentication via **Google OAuth** and **Magic Link (email)**.

## Stack

- **Framework**: Next.js 14 (App Router)
- **Auth**: NextAuth.js v5 (Auth.js)
- **Database**: Prisma + SQLite (swap to Postgres for production)
- **Styling**: Tailwind CSS
- **Language**: TypeScript

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env` and fill in your values:

```bash
cp .env .env.local
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | SQLite path (default: `file:./dev.db`) |
| `AUTH_SECRET` | Random secret — run `openssl rand -base64 32` |
| `AUTH_GOOGLE_ID` | Google OAuth client ID |
| `AUTH_GOOGLE_SECRET` | Google OAuth client secret |
| `EMAIL_SERVER_HOST` | SMTP host |
| `EMAIL_SERVER_PORT` | SMTP port |
| `EMAIL_SERVER_USER` | SMTP username |
| `EMAIL_SERVER_PASSWORD` | SMTP password |
| `EMAIL_FROM` | From address for magic link emails |

### 3. Set up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project → APIs & Services → Credentials
3. Create an OAuth 2.0 Client ID (Web application)
4. Add `http://localhost:3000/api/auth/callback/google` as an authorized redirect URI

### 4. Set up the database

```bash
npx prisma migrate dev --name init
```

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
src/
├── app/
│   ├── api/auth/[...nextauth]/  # NextAuth route handler
│   ├── dashboard/               # Protected dashboard pages
│   │   ├── layout.tsx           # Dashboard shell with nav
│   │   ├── page.tsx             # Dashboard home
│   │   └── settings/page.tsx   # Settings page
│   ├── login/page.tsx           # Login page
│   ├── verify-request/page.tsx  # Magic link sent confirmation
│   ├── auth-error/page.tsx      # Auth error page
│   └── layout.tsx               # Root layout
├── auth.ts                      # NextAuth config
├── middleware.ts                # Route protection
├── lib/
│   └── prisma.ts                # Prisma client singleton
└── types/
    └── next-auth.d.ts           # Session type extensions
```

## Deploying

For production, swap SQLite for Postgres by updating `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Then update `DATABASE_URL` in your hosting environment.
