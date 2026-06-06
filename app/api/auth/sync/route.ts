import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await req.json();
  const { name } = body;

  const existingUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (!existingUser) {
    await prisma.user.create({
      data: {
        id: user.id,
        email: user.email ?? "",
        name: name || user.email?.split("@")[0], // fallback
        companyId: null,
        roleId: null,
        isActive: true,
      },
    });
  } else {
    // optional: update name if missing
    if (!existingUser.name && name) {
      await prisma.user.update({
        where: { id: user.id },
        data: { name },
      });
    }
  }

  return NextResponse.json({ success: true });
}