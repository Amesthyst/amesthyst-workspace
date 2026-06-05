import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (!existingUser) {
    await prisma.user.create({
      data: {
        id: user.id,
        email: user.email ?? "",
        companyId: null,
        roleId: null,
        isActive: true,
      },
    });
  }

  return NextResponse.json({ success: true });
}