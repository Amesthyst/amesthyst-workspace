import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { validateHRAccess } from "@/lib/auth/validateHRAccess";

export async function PATCH(req: Request) {
  try {
    const authUser = await validateHRAccess();

    if (!authUser) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { userId, roleName } = body;

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (targetUser.role?.name === "OWNER") {
      return NextResponse.json(
        { error: "Owner role cannot be modified" },
        { status: 403 }
      );
    }

    const role = await prisma.role.findUnique({
      where: { name: roleName },
    });

    if (!role) {
      return NextResponse.json(
        { error: "Role not found" },
        { status: 404 }
      );
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        roleId: role.id,
      },
    });

    return NextResponse.json({ success: true });

  } catch (err) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}