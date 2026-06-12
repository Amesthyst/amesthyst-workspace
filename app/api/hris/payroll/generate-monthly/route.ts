import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateHRAccess } from "@/lib/auth/validateHRAccess";

export async function POST(req: Request) {
  const user = await validateHRAccess();

  if (!user) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { companyId, month, year } = await req.json();

  const employees = await prisma.employee.findMany({
    where: { companyId },
  });

  const payrolls = await Promise.all(
    employees.map((e) =>
      prisma.payroll.create({
        data: {
          employeeId: e.id,
          companyId,
          month,
          year,
          baseSalary: 0,
          allowance: 0,
          deduction: 0,
          totalSalary: 0,
          status: "DRAFT",
        },
      })
    )
  );

  return NextResponse.json(payrolls);
}