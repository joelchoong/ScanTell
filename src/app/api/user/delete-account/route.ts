import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/shared/server/db";
import { requireAuthApi } from "@/features/auth/server/getAuthenticatedUser";
import { signOut } from "@/features/auth/server/authConfig";
import { del } from "@vercel/blob";

export async function POST(req: NextRequest) {
  try {
    const result = await requireAuthApi();
    if (result instanceof NextResponse) return result;
    const { userId } = result;

    // 1. Fetch user's documents to delete files from Vercel Blob
    const documents = await prisma.document.findMany({
      where: { userId },
      select: { fileUrl: true },
    });

    if (documents.length > 0) {
      const urls = documents.map(d => d.fileUrl);
      try {
        await del(urls, { token: process.env.BLOB_READ_WRITE_TOKEN });
      } catch (blobErr) {
        console.error("Failed to delete user blobs during account deletion:", blobErr);
      }
    }

    // 2. Delete all UserQuestions first to avoid reference issues
    await prisma.userQuestion.deleteMany({
      where: { userId },
    });

    // 3. Delete all Document rows
    await prisma.document.deleteMany({
      where: { userId },
    });

    // 4. Anonymize user data by removing name and email
    await prisma.user.update({
      where: { id: userId },
      data: { 
        name: null,
        email: `deleted-${userId}@scantell.local`,
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    const message = process.env.NODE_ENV === "development" && err instanceof Error
      ? err.message
      : "Something went wrong. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
