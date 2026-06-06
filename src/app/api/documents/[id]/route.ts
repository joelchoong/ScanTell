import { NextRequest, NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { prisma } from "@/shared/server/db";
import { requireAuthApi } from "@/features/auth/server/getAuthenticatedUser";

// PATCH /api/documents/[id] — rename
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuthApi();
  if (authResult instanceof NextResponse) return authResult;
  const { userId } = authResult;

  const { id } = await params;
  const { name } = await req.json();

  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }

  try {
    // Ensure the document belongs to the authenticated user
    const doc = await prisma.document.findFirst({ where: { id, userId } });
    if (!doc) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }

    const updated = await prisma.document.update({
      where: { id },
      data: { name: name.trim() },
    });

    return NextResponse.json({ document: updated });
  } catch (err) {
    console.error("[documents/patch] error:", err);
    return NextResponse.json({ error: "Failed to rename." }, { status: 500 });
  }
}

// DELETE /api/documents/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuthApi();
  if (authResult instanceof NextResponse) return authResult;
  const { userId } = authResult;

  const { id } = await params;

  try {
    // Ensure the document belongs to the authenticated user
    const doc = await prisma.document.findFirst({ where: { id, userId } });
    if (!doc) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }

    // Delete from Vercel Blob
    await del(doc.fileUrl, { token: process.env.BLOB_READ_WRITE_TOKEN });

    // Delete from Neon
    await prisma.document.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[documents/delete] error:", err);
    return NextResponse.json({ error: "Failed to delete." }, { status: 500 });
  }
}
