import { prisma } from "@/lib/prisma";

export async function generateEmployeeNumber(companyId: string) {
  const year = new Date().getFullYear();

  const result = await prisma.$transaction(async (tx) => {
    
    // 1. Get or create counter
    let counter = await tx.employeeNumberCounter.findUnique({
      where: {
        companyId_year: {
          companyId,
          year,
        },
      },
    });

    if (!counter) {
      counter = await tx.employeeNumberCounter.create({
        data: {
          companyId,
          year,
          current: 0,
        },
      });
    }

    // 2. Increment safely
    const updated = await tx.employeeNumberCounter.update({
      where: {
        companyId_year: {
          companyId,
          year,
        },
      },
      data: {
        current: {
          increment: 1,
        },
      },
    });

    const number = updated.current;

    // 3. Format EMP number
    const employeeNumber = `EMP-${year}-${String(number).padStart(4, "0")}`;

    return employeeNumber;
  });

  return result;
}