import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { prisma } from "@/shared/server/db";
import { requireAuthApi } from "@/features/auth/server/getAuthenticatedUser";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export async function POST(req: NextRequest) {
  // Auth check
  const authResult = await requireAuthApi();
  if (authResult instanceof NextResponse) return authResult;
  const { userId } = authResult;

  // Debug — remove after confirming
  console.log("[upload] BLOB_READ_WRITE_TOKEN present:", !!process.env.BLOB_READ_WRITE_TOKEN);
  console.log("[upload] BLOB_STORE_ID present:", !!process.env.BLOB_STORE_ID);

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    // PDF only
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are supported." },
        { status: 400 }
      );
    }

    // Size limit
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size must be under 20MB." },
        { status: 400 }
      );
    }

    // Upload to Vercel Blob — stored under userId prefix for organisation
    const blob = await put(`documents/${userId}/${file.name}`, file, {
      access: "public",
      contentType: "application/pdf",
    });

    // Save metadata to Neon — always scoped to userId
    const document = await prisma.document.create({
      data: {
        userId,
        name: file.name,
        fileUrl: blob.url,
        fileSize: file.size,
      },
    });

    return NextResponse.json({ document }, { status: 201 });
  } catch (err) {
    console.error("[upload] error:", err);
    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 500 }
    );
  }
}
