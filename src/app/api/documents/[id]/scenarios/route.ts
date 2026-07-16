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
    // Ensure the document exists and belongs to the user
    const doc = await prisma.document.findFirst({
      where: { id, userId },
    });

    if (!doc) {
      return NextResponse.json(
        { error: "Document not found or unauthorized access." },
        { status: 404 }
      );
    }

    const docType = doc.isInsuranceDocument ? "insurance" : "general";

    // Query scenarios scoped to the document's type
    const scenarios = await prisma.$queryRaw`
      SELECT id, title, icon, query, description, "documentTypes", "usageCount"
      FROM "Scenario"
      WHERE "documentTypes" @> ARRAY[${docType}]::text[]
      ORDER BY "usageCount" DESC
      LIMIT 4
    `;

    return NextResponse.json({ scenarios });
  } catch (err) {
    console.error("[documents/scenarios] error:", err);
    return NextResponse.json(
      { error: "Failed to fetch scenarios" },
      { status: 500 }
    );
  }
}
