import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const employee = await prisma.employee.findUnique({
    where: { userId: user.id },
  });

  if (!employee) {
    return NextResponse.json({ error: "Employee not found" }, { status: 404 });
  }

  const today = new Date();

  const attendance = await prisma.attendance.create({
    data: {
      employeeId: employee.id,
      clockIn: today,
    },
  });

  return NextResponse.json(attendance);
}