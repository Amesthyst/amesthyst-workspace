import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateHRAccess } from "@/lib/auth/validateHRAccess";

export async function GET(req: Request) {
  const user = await validateHRAccess();

  if (!user) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) {
    return NextResponse.json([]);
  }

  const payrolls = await prisma.payroll.findMany({
    where: { companyId },
    include: {
      employee: {
        include: {
          user: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(payrolls);
}

export async function POST(req: Request) {
    const user = await validateHRAccess();
  
    if (!user) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  
    const body = await req.json();
  
    const {
      employeeId,
      companyId,
      month,
      year,
      baseSalary,
      allowance,
    } = body;
  
    // 🧠 AUTO CALCULATION LOGIC
    const deduction = Math.floor(baseSalary * 0.05); // 5% simple rule
    const totalSalary = baseSalary + (allowance || 0) - deduction;
  
    const payroll = await prisma.payroll.create({
      data: {
        employeeId,
        companyId,
        month,
        year,
        baseSalary,
        allowance: allowance || 0,
        deduction,
        totalSalary,
        status: "DRAFT",
      },
    });
  
    return NextResponse.json(payroll);
  }