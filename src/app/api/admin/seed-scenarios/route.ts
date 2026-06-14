import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/shared/server/db";
import { requireAuthApi } from "@/features/auth/server/getAuthenticatedUser";
import { Prisma } from "@prisma/client";

const commonInsuranceScenarios = [
  {
    title: "Annual vs Lifetime Limits",
    icon: "TrendingUp",
    query: "What are the annual and lifetime coverage limits? How much does the insurance pay each year vs across my lifetime?",
    description: "Understand how much your insurance pays each year vs across your lifetime, and why this affects long-term medical coverage.",
    documentTypes: ["insurance", "health"],
  },
  {
    title: "What Can Delay or Reject Claims",
    icon: "AlertCircle",
    query: "What conditions can delay or reject my claims? What are the waiting periods and pre-approval requirements?",
    description: "Learn about waiting periods, pre-approvals, and other conditions that may slow down, reduce, or reject your claim.",
    documentTypes: ["insurance", "health"],
  },
  {
    title: "Surgeries Not Covered",
    icon: "Scissors",
    query: "What types of surgeries are NOT covered? Are cosmetic, elective, or non-medically necessary procedures excluded?",
    description: "Find out which types of surgeries are usually excluded, such as cosmetic, elective, or non-medically necessary procedures.",
    documentTypes: ["insurance", "health"],
  },
  {
    title: "Does Your Coverage Change Over Time?",
    icon: "Clock",
    query: "How do premiums increase with age? Can my coverage or policy terms change after I make a claim?",
    description: "See how premiums increase with age and whether your coverage or policy terms can change after you make a claim.",
    documentTypes: ["insurance", "health"],
  },
];

export async function POST(req: NextRequest) {
  // Temporarily disable auth for seeding
  // const authResult = await requireAuthApi();
  // if (authResult instanceof NextResponse) return authResult;

  try {
    console.log("Seeding scenarios using raw SQL...");

    // Delete existing scenarios first
    console.log("Deleting existing scenarios...");
    await prisma.$executeRaw`DELETE FROM "Scenario"`;

    for (const scenario of commonInsuranceScenarios) {
      console.log("Inserting scenario:", scenario.title);
      await prisma.$executeRaw`
        INSERT INTO "Scenario" (id, title, icon, query, description, "documentTypes", "usageCount", "createdAt", "updatedAt")
        VALUES (
          gen_random_uuid(),
          ${scenario.title},
          ${scenario.icon},
          ${scenario.query},
          ${scenario.description},
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
