import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@tuiton/db";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const challenges = await prisma.challenge.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { submissions: true } } },
  });
  return NextResponse.json(challenges);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { kind, title, prompt, cadence, difficulty, strand, options, answer, starter, xp, dayKey, weekKey, monthKey, startsAt, endsAt, published } = body;

  if (!kind || !title || !prompt) {
    return NextResponse.json({ error: "Kind, title, and prompt are required" }, { status: 400 });
  }

  const challenge = await prisma.challenge.create({
    data: {
      kind,
      title: title.trim(),
      prompt: prompt.trim(),
      cadence: cadence || "DAILY",
      difficulty: difficulty || "BEGINNER",
      strand: strand?.trim() || null,
      options: options ? JSON.stringify(options) : null,
      answer: answer?.trim() || null,
      starter: starter?.trim() || null,
      xp: xp || 10,
      dayKey: dayKey ?? null,
      weekKey: weekKey ?? null,
      monthKey: monthKey?.trim() || null,
      startsAt: startsAt ? new Date(startsAt) : null,
      endsAt: endsAt ? new Date(endsAt) : null,
      createdBy: session.sub,
      published: published ?? true,
    },
  });
  return NextResponse.json(challenge);
}