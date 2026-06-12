import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}
function generateEmployeeNumber() {
  return `EMP-${Date.now()}-${Math.floor(
    Math.random() * 1000
  )}`;
}
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { name, industry, userId } = body;

    const ownerRole = await prisma.role.findUnique({
      where: {
        name: "OWNER",
      },
    });

    if (!ownerRole) {
      return NextResponse.json(
        { error: "OWNER role not found" },
        { status: 500 }
      );
    }

    const company = await prisma.company.create({
      data: {
        name,
        industry,
        code: generateCode(),
      },
    });

    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        companyId: company.id,
        roleId: ownerRole.id,
      },
    });

    await prisma.employee.create({
      data: {
        employeeNumber : generateEmployeeNumber(),
        companyId: company.id,
        userId,
        jobTitle: "Owner",
        status: "ACTIVE",
      },
    });

    return NextResponse.json(company);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to create company" },
      { status: 500 }
    );
  }
}