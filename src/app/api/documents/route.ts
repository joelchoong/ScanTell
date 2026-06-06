import { NextResponse } from "next/server";
import { prisma } from "@/shared/server/db";
import { requireAuthApi } from "@/features/auth/server/getAuthenticatedUser";

export async function GET() {
  // Auth check
  const authResult = await requireAuthApi();
  if (authResult instanceof NextResponse) return authResult;
  const { userId } = authResult;

  try {
    const documents = await prisma.document.findMany({
      where: { userId }, // always scoped to the authenticated user
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        fileUrl: true,
        fileSize: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ documents });
  } catch (err) {
    console.error("[documents] error:", err);
    return NextResponse.json(
      { error: "Failed to fetch documents." },
      { status: 500 }
    );
  }
}
