import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

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

  const pref = await prisma.userPreference.findUnique({
    where: { userId: user.id },
  });

  return NextResponse.json(
    pref ?? {
      displayName: "",
      avatarUrl: "",
      jobTitle: "",
      bio: "",
      theme: "system",
      density: "comfortable",
      language: "en",
      timeFormat: "24h",
    }
  );
}

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

  const pref = await prisma.userPreference.upsert({
    where: { userId: user.id },

    update: {
      displayName: body.displayName ?? "",
      avatarUrl: body.avatarUrl ?? "",
      jobTitle: body.jobTitle ?? "",
      bio: body.bio ?? "",

      theme: body.theme ?? "system",
      density: body.density ?? "comfortable",
      language: body.language ?? "en",
      timeFormat: body.timeFormat ?? "24h",
    },

    create: {
      userId: user.id,

      displayName: body.displayName ?? "",
      avatarUrl: body.avatarUrl ?? "",
      jobTitle: body.jobTitle ?? "",
      bio: body.bio ?? "",

      theme: body.theme ?? "system",
      density: body.density ?? "comfortable",
      language: body.language ?? "en",
      timeFormat: body.timeFormat ?? "24h",
    },
  });

  return NextResponse.json(pref);
}