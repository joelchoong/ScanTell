---
inclusion: always
---

# Security Rules — Always Enforce

## Authentication guard

Every API route and server action that accesses user data MUST call `requireAuthApi()` or `requireAuth()` before any database query.

### In API routes (`route.ts`):
```ts
import { requireAuthApi } from "@/features/auth/server/getAuthenticatedUser";

export async function GET() {
  const result = await requireAuthApi();
  if (result instanceof NextResponse) return result; // returns 401
  const { userId } = result;

  // Always scope queries to userId
  const data = await prisma.someModel.findMany({ where: { userId } });
}
```

### In Server Actions:
```ts
import { requireAuth } from "@/features/auth/server/getAuthenticatedUser";

export async function someAction() {
  const userId = await requireAuth(); // throws if not authenticated

  // Always scope queries to userId
  const data = await prisma.someModel.findMany({ where: { userId } });
}
```

## Rules
- NEVER query the database without first verifying the session
- ALWAYS filter queries by `userId` — never return all rows from a user-owned table
- NEVER trust user-supplied IDs — always use `userId` from the session, not from request params
- The `User`, `Account`, `Session` tables are managed by NextAuth — do not query them directly except in auth-related code

---

## Future: Row Level Security (RLS)

### Why RLS matters for this app
ScanTell handles potentially sensitive insurance and legal documents. A single application-layer bug — such as a missing `where: { userId }` clause — could expose one user's documents to another. RLS adds a second security boundary at the database level that blocks this even if the application layer has a bug.

**Without RLS:**
```
Bug in query → User A gets User B's documents
```

**With RLS:**
```
Bug in query → Database rejects it → User A gets only their own data
```

### Current status
- **Phase: MVP** — application-layer enforcement only via `requireAuth()` / `requireAuthApi()`
- RLS is not yet enabled in Neon
- This is acceptable for early development and internal testing

### When to add RLS
Evaluate adding RLS before going live with real users, specifically when:
- The schema for `Document`, `Simulation`, and user-owned tables has stabilised
- There are real users uploading real sensitive documents
- The app moves beyond MVP/beta

### Tables that will need RLS policies when implemented
- `Document` — user-uploaded files, insurance policies, contracts
- `Simulation` — scenario results derived from documents
- `Profile` / any user preferences or personal data added in future

### How to implement when ready
1. Create a Postgres role per-user or use a `SET LOCAL app.user_id` approach
2. Enable RLS on each table: `ALTER TABLE "Document" ENABLE ROW LEVEL SECURITY;`
3. Add policies: `CREATE POLICY user_isolation ON "Document" USING (userId = current_setting('app.user_id'));`
4. Pass the authenticated userId into the DB session via the Prisma middleware or connection string

### Note
For a solo-built MVP, start without RLS and enforce at the application layer.
For a production insurance platform handling real customer documents, RLS should be seriously evaluated and implemented before public launch.
