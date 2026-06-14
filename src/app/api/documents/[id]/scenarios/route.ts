import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/shared/server/db";
import { requireAuthApi } from "@/features/auth/server/getAuthenticatedUser";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuthApi();
  if (authResult instanceof NextResponse) return authResult;
  const { userId } = authResult;

  const { id } = await params;

  try {
    console.log("[documents/scenarios] Fetching scenarios for document:", id);

    // Simply return top 4 insurance scenarios
    const scenarios = await prisma.$queryRaw`
      SELECT id, title, icon, query, description, "documentTypes", "usageCount"
      FROM "Scenario"
      WHERE "documentTypes" @> ARRAY['insurance']::text[]
      ORDER BY "usageCount" DESC
      LIMIT 4
    `;

    console.log("[documents/scenarios] Retrieved scenarios:", scenarios);

    return NextResponse.json({ scenarios });
  } catch (err) {
    console.error("[documents/scenarios] error:", err);
    return NextResponse.json(
      { error: "Failed to fetch scenarios" },
      { status: 500 }
    );
  }
}
