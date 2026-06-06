import { auth } from "./authConfig";
import { NextResponse } from "next/server";

/**
 * Use in Server Actions and server components.
 * Throws "Unauthorized" if no valid session — Next.js will surface this as a 401.
 *
 * @example
 * const userId = await requireAuth();
 * const docs = await prisma.document.findMany({ where: { userId } });
 */
export async function requireAuth(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session.user.id;
}

/**
 * Use in API Route handlers (route.ts).
 * Returns { userId } on success or a 401 NextResponse to return early.
 *
 * @example
 * const result = await requireAuthApi();
 * if (result instanceof NextResponse) return result;
 * const { userId } = result;
 */
export async function requireAuthApi(): Promise<
  { userId: string } | NextResponse
> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return { userId: session.user.id };
}

// Legacy alias — kept for backwards compatibility
export const getAuthenticatedUser = requireAuth;
