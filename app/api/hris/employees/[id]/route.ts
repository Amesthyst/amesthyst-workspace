import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const body = await req.json();

    const employee =
      await prisma.employee.findUnique({
        where: { id },
      });

    if (!employee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    await prisma.employee.update({
      where: { id },
      data: {
        jobTitle: body.jobTitle,
      },
    });

    await prisma.user.update({
      where: {
        id: employee.userId,
      },
      data: {
        name: body.name,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to update employee" },
      { status: 500 }
    );
  }
}