import { prisma } from "@/shared/server/db";

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

export async function seedScenarios() {
  console.log("Seeding scenarios...");

  for (const scenario of commonInsuranceScenarios) {
    await prisma.scenario.upsert({
      where: { title: scenario.title },
      update: {},
      create: scenario,
    });
  }

  console.log("Scenarios seeded successfully!");
}

// Run if called directly
if (require.main === module) {
  seedScenarios()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
