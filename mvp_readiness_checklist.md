# ScanTell MVP Readiness Checklist

This checklist tracks the priorities and fixes for the ScanTell MVP launch. As issues are resolved, they will be marked as complete.

## 🔴 Critical — Must Fix Before Launch

- [x] **1. Admin seed endpoint has no auth** (`src/app/api/admin/seed-scenarios/route.ts`)
  - Restored `requireAuthApi()` guard in the route.
- [x] **2. Scenarios endpoint doesn't verify document ownership** (`src/app/api/documents/[id]/scenarios/route.ts`)
  - Added `prisma.document.findFirst({ where: { id, userId } })` ownership check + dynamic document type scoping.
- [x] **3. Delete account doesn't clean up documents or Vercel Blob files** (`src/app/api/user/delete-account/route.ts`)
  - Route now deletes Vercel Blob files, UserQuestion rows, and Document rows before anonymizing the user.
- [x] **4. Prisma global cache disabled in development/production** (`src/shared/server/db.ts`)
  - Uncommented `globalForPrisma.prisma = prisma` to re-enable connection pooling.
- [x] **5. `env.ts` requires unused/undeployed keys** (`src/lib/env.ts`)
  - Moved `RESEND_API_KEY`/`RESEND_FROM_EMAIL` to optional. Added `BLOB_READ_WRITE_TOKEN`/`GEMINI_API_KEY` as required. All email routes now log URLs to console when Resend is unconfigured.
- [x] **6. forgot-password page doesn't exist** (`src/app/forgot-password/page.tsx`)
  - Created a branded `/forgot-password` page with form validation, toast notifications, and Resend API integration.
- [x] **7. Login form is missing a "Forgot password?" link** (`src/features/auth/components/LoginForm.tsx`)
  - Added "Forgot password?" link below the password field.
- [x] **8. Prisma client generated types out of sync**
  - Ran `npx prisma generate` — types now include the `answer` field on `UserQuestion`.

## 🟠 Important — Should Fix Before Launch

- [x] **9. Route protection middleware is inactive**
  - Renamed `src/proxy.ts` to `src/middleware.ts` — NextAuth middleware guard is now active for `/dashboard`, `/explore`, `/chat`, and `/profile`.
- [x] **10. Scenarios not scoped to user's document type** (`src/app/api/documents/[id]/scenarios/route.ts`)
  - Scenarios route and analyze route now use dynamic `docType` (`"insurance"` / `"general"`) based on `isInsuranceDocument`.
- [x] **11. File size limit mismatch** (`src/features/dashboard/components/HeroCard.tsx` & `src/app/faq/page.tsx`)
  - HeroCard client-side check changed from 20MB to 5MB. FAQ page updated to show 5MB.
- [x] **12. No rate limiting on AI endpoints**
  - Added IP-based rate limiting to `/api/documents/[id]/analyze` (10 req/min), `/api/documents/[id]/scenario-answer` (15 req/min), `/api/chat` (20 req/min), and `/api/auth/validate-reset-token` (10 req/min) using the simple rate limit utility.
- [x] **13. No loading/recovery retry states when navigating back to explored documents** (`src/app/explore/page.tsx`)
  - Added a "Retry" button to the analysis error box in the explore view, letting users reload the page/scenarios without needing to clear and upload the file again.
- [x] **14. Profile settings buttons unwired**
  - *Status: Fully Wired.* The "Save changes" button in `ProfileSettingsForm.tsx` is wired to `/api/user/update-name`, and the "Delete account" button in `EditProfilePage` is wired to `/api/user/delete-account`.
- [x] **15. Chat history is unbounded** (`src/app/api/chat/route.ts`)
  - Limited the conversation history sent to the Gemini API to the last 20 messages to avoid token limit errors during long conversations.
- [x] **16. Clean up console.log statements**
  - Removed developer logs in pages and API routes that are verbose in production environment logs. Cleaned up explore page, scenario-answer route, scenarios route, and seed-scenarios route.

## 🟡 Minor — Nice to Fix

- [x] **17. Delete unused / dead code files**
  - Deleted `src/lib/services/documentsService.ts`, `src/features/dashboard/components/InsightCard.tsx`, `src/features/dashboard/components/ScanItem.tsx`, `src/features/auth/components/PasswordLoginForm.tsx`, and `src/features/auth/components/MagicLinkForm.tsx`.
- [x] **18. Add missing BottomNav to scenario details** (`src/app/explore/scenario/page.tsx`)
  - Rendered the standard `BottomNav` on the scenario detail page.
- [x] **19. Missing back button fallback** (`src/app/explore/scenario/page.tsx`)
  - Added fallback to `/explore` if navigating back when `documentId` is missing from the search parameters.
- [x] **20. No root error boundary**
  - Added `src/app/error.tsx` to handle uncaught server/client exceptions and show a premium, branded error screen.
- [x] **21. No custom 404 page**
  - Added `src/app/not-found.tsx` to show a branded 404 screen when users navigate to invalid paths.
