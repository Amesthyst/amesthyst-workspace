import { prisma } from "@/lib/prisma";

async function main() {
  const roles = [
    "OWNER",
    "ADMIN",
    "MANAGER",
    "EMPLOYEE",
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: {
        name: role,
      },
      update: {},
      create: {
        name: role,
      },
    });
  }

  console.log("Roles seeded");
}

main();