import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function generateEmployeeNumber() {
  return `EMP-${Date.now()}-${Math.floor(
    Math.random() * 1000
  )}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { userId, companyCode } = body;

    const company = await prisma.company.findUnique({
      where: {
        code: companyCode,
      },
    });

    if (!company) {
      return NextResponse.json(
        { error: "Invalid company code" },
        { status: 404 }
      );
    }

    const employeeRole = await prisma.role.findUnique({
      where: {
        name: "EMPLOYEE",
      },
    });

    if (!employeeRole) {
      return NextResponse.json(
        { error: "EMPLOYEE role not found" },
        { status: 500 }
      );
    }

    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        companyId: company.id,
        roleId: employeeRole.id,
      },
    });

    const existingEmployee =
      await prisma.employee.findUnique({
        where: {
          userId,
        },
      });

    if (!existingEmployee) {
      await prisma.employee.create({
        data: {
          employeeNumber: generateEmployeeNumber(),
          companyId: company.id,
          userId,
          jobTitle: "Employee",
          status: "ACTIVE",
        },
      });
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to join company" },
      { status: 500 }
    );
  }
}