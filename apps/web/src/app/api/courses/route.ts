import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@tuiton/db";
import { getSession } from "@/lib/session";

const courseSchema = z.object({
  title: z.string().trim().min(3).max(120),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(120),
  description: z.string().trim().max(4000).default(""),
  kind: z.enum(["primary", "secondary", "advanced", "certification"]),
  tier: z.enum(["FREE", "PAID"]),
  price: z.number().int().positive().optional(),
  durationWeeks: z.number().int().min(1).max(104).default(12),
  subjectArea: z.string().trim().min(1).max(80),
  gradeLevel: z.string().trim().min(1).max(40),
  prerequisites: z.array(z.string().max(120)).max(30).default([]),
  learningObjectives: z.array(z.string().trim().min(1).max(300)).max(30).default([]),
  mediaUrl: z.string().url().optional(),
  xpAwarded: z.number().int().min(0).max(10000).default(50),
  isPublished: z.boolean().default(true),
});

export async function GET(req: Request) {
  const query = new URL(req.url).searchParams;
  const search = query.get("search")?.trim();
  const kind = query.get("kind");
  const tier = query.get("tier");
  const courses = await prisma.course.findMany({
    where: {
      isPublished: true,
      ...(kind ? { kind } : {}),
      ...(tier === "FREE" || tier === "PAID" ? { tier } : {}),
      ...(search ? { OR: [
        { title: { contains: search } },
        { subjectArea: { contains: search } },
        { description: { contains: search } },
      ] } : {}),
    },
    orderBy: [{ kind: "asc" }, { title: "asc" }],
    select: {
      id: true, title: true, slug: true, description: true, kind: true,
      tier: true, price: true, durationWeeks: true, subjectArea: true,
      gradeLevel: true, learningObjectives: true, xpAwarded: true,
    },
  });
  return NextResponse.json(courses);
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
  const parsed = courseSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid course details.", details: parsed.error.flatten() }, { status: 400 });
  if (parsed.data.tier === "PAID" && !parsed.data.price) {
    return NextResponse.json({ error: "Paid courses must have a positive price." }, { status: 400 });
  }
  const { prerequisites, learningObjectives, ...data } = parsed.data;
  try {
    const course = await prisma.course.create({
      data: {
        ...data,
        price: data.tier === "FREE" ? null : data.price ?? null,
        prerequisites: JSON.stringify(prerequisites),
        learningObjectives: JSON.stringify(learningObjectives),
      },
    });
    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "A course with that slug already exists." }, { status: 409 });
    }
    throw error;
  }
}
