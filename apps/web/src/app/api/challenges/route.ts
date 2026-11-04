import { NextResponse } from "next/server";
import { prisma } from "@tuiton/db";
import { getSession } from "@/lib/session";

/**
 * Challenges API - Enhanced gamification system
 * 
 * Endpoints:
 * - GET /api/challenges - List all challenges with filters
 * - POST /api/challenges - Create a new challenge (admin)
 * - GET /api/challenges/stats - Get challenge statistics
 * - GET /api/challenges/leaderboard - Get challenge leaderboard
 */

// GET - List all challenges with optional filters
export async function GET(
  req: Request
) {
  const cadence = new URL(req.url).searchParams.get("cadence");
  const where = cadence
    ? { cadence, published: true }
    : {};

  const challenges = await prisma.challenge.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { submissions: { where: { autoPassed: true } } },
      },
    },
  });

  return NextResponse.json(challenges);
}

// POST - Create a new challenge (admin only)
export async function POST(
  req: Request
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized - Admin required" }, { status: 401 });
  }

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
      xp: Number.isInteger(xp) && xp > 0 ? xp : 10,
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
