import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/shared/server/db";
import { requireAuthApi } from "@/features/auth/server/getAuthenticatedUser";

// DELETE /api/documents/[id]/clear-cache
// Clears cached scenario answers so they regenerate with the latest prompt
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuthApi();
  if (authResult instanceof NextResponse) return authResult;
  const { userId } = authResult;

  const { id } = await params;

  const doc = await prisma.document.findFirst({ where: { id, userId } });
  if (!doc) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  await prisma.document.update({
    where: { id },
    data: { scenarioAnswers: {} },
  });

  return NextResponse.json({ success: true });
}
