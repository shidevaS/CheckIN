import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@tuiton/db";
import { getSession } from "@/lib/session";

const competitionSchema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().min(1).max(4000),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  prize: z.string().trim().min(1).max(200),
  tier: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  maxParticipants: z.number().int().positive().optional(),
  isPublished: z.boolean().default(true),
}).refine((value) => new Date(value.endDate) > new Date(value.startDate), {
  path: ["endDate"], message: "End date must be after start date.",
});

export async function GET(req: Request) {
  const tier = new URL(req.url).searchParams.get("tier");
  const competitions = await prisma.competition.findMany({
    where: { isPublished: true, ...(tier ? { tier } : {}) },
    orderBy: { startDate: "asc" },
    include: { _count: { select: { enrollments: true } } },
  });
  return NextResponse.json(competitions);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }
  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }
  const parsed = competitionSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid competition details.", details: parsed.error.flatten() }, { status: 400 });
  const competition = await prisma.competition.create({
    data: {
      ...parsed.data,
      startDate: new Date(parsed.data.startDate),
      endDate: new Date(parsed.data.endDate),
    },
  });
  return NextResponse.json(competition, { status: 201 });
}
