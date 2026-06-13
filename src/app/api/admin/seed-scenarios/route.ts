import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/shared/server/db";
import { requireAuthApi } from "@/features/auth/server/getAuthenticatedUser";
import { Prisma } from "@prisma/client";

const commonInsuranceScenarios = [
  {
    title: "I am diagnosed with cancer",
    icon: "Stethoscope",
    query: "What coverage do I have if I'm diagnosed with cancer?",
    documentTypes: ["insurance", "health"],
  },
  {
    title: "I have a heart attack",
    icon: "Heart",
    query: "What coverage do I have if I have a heart attack?",
    documentTypes: ["insurance", "health"],
  },
  {
    title: "I have a stroke",
    icon: "Brain",
    query: "What coverage do I have if I have a stroke?",
    documentTypes: ["insurance", "health"],
  },
  {
    title: "I am hospitalised",
    icon: "Building2",
    query: "What coverage do I have if I'm hospitalised?",
    documentTypes: ["insurance", "health"],
  },
  {
    title: "I need surgery",
    icon: "Activity",
    query: "What coverage do I have if I need surgery?",
    documentTypes: ["insurance", "health"],
  },
  {
    title: "I need emergency treatment",
    icon: "AlertTriangle",
    query: "What coverage do I have for emergency treatment?",
    documentTypes: ["insurance", "health"],
  },
  {
    title: "I need diagnostic tests",
    icon: "FileText",
    query: "What coverage do I have for diagnostic tests like MRI or CT scans?",
    documentTypes: ["insurance", "health"],
  },
  {
    title: "I need prescription medication",
    icon: "Pill",
    query: "What coverage do I have for prescription medications?",
    documentTypes: ["insurance", "health"],
  },
  {
    title: "I need specialist consultation",
    icon: "User",
    query: "What coverage do I have for specialist consultations?",
    documentTypes: ["insurance", "health"],
  },
  {
    title: "I need mental health treatment",
    icon: "Smile",
    query: "What coverage do I have for mental health treatment?",
    documentTypes: ["insurance", "health"],
  },
];

export async function POST(req: NextRequest) {
  // Temporarily disable auth for seeding
  // const authResult = await requireAuthApi();
  // if (authResult instanceof NextResponse) return authResult;

  try {
    console.log("Seeding scenarios using raw SQL...");

    for (const scenario of commonInsuranceScenarios) {
      console.log("Inserting scenario:", scenario.title);
      await prisma.$executeRaw`
        INSERT INTO "Scenario" (id, title, icon, query, "documentTypes", "usageCount", "createdAt", "updatedAt")
        VALUES (
          gen_random_uuid(),
          ${scenario.title},
          ${scenario.icon},
          ${scenario.query},
          ${scenario.documentTypes},
          0,
          NOW(),
          NOW()
        )
      `;
    }

    console.log("Scenarios seeded successfully!");

    return NextResponse.json({ message: "Scenarios seeded successfully" });
  } catch (error) {
    console.error("Error seeding scenarios:", error);
    return NextResponse.json(
      { error: `Failed to seed scenarios: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}
