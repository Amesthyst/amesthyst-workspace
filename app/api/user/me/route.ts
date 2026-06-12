import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
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

  const dbUser = await prisma.user.findUnique({
    where: {
      id: user.id,
    },
    include: {
      role: true,
      company: {
        include: {
          settings: true,
        },
      },
      employee: true,
    },
  });

  return NextResponse.json(dbUser);
}