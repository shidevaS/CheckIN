import { NextResponse } from "next/server";
import { prisma } from "@tuiton/db";
import { getSession } from "@/lib/session";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  const course = await prisma.course.findFirst({
    where: { id, isPublished: true },
    include: {
      _count: { select: { enrollments: true } },
      enrollments: session ? {
        where: { userId: session.sub },
        select: { progress: true, completed: true, enrolledAt: true },
        take: 1,
      } : false,
    },
  });
  if (!course) return NextResponse.json({ error: "Course not found." }, { status: 404 });
  const enrollment = session && "enrollments" in course ? course.enrollments[0] : undefined;
  return NextResponse.json({ ...course, isEnrolled: Boolean(enrollment), progress: enrollment?.progress ?? 0 });
}
