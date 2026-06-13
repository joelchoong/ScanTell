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
    // Fetch document to check if it's an insurance document
    const doc = await prisma.document.findFirst({
      where: { id, userId },
    });

    if (!doc) {
      return NextResponse.json({ error: "Document not found." }, { status: 404 });
    }

    // If not an insurance document, return empty scenarios
    if (!doc.isInsuranceDocument) {
      return NextResponse.json({ scenarios: [] });
    }

    // Retrieve relevant scenarios based on document type
    const scenarios = await prisma.$queryRaw`
      SELECT id, title, icon, query, "documentTypes", "usageCount"
      FROM "Scenario"
      WHERE "documentTypes" @> ARRAY['insurance']::text[]
      ORDER BY "usageCount" DESC
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
