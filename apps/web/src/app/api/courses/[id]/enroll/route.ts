import { NextResponse } from "next/server";
import { prisma } from "@tuiton/db";
import { getSession } from "@/lib/session";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in to enroll." }, { status: 401 });
  if (session.role !== "STUDENT") return NextResponse.json({ error: "Only student accounts can enroll." }, { status: 403 });

  const { id } = await params;
  const course = await prisma.course.findFirst({ where: { id, isPublished: true } });
  if (!course) return NextResponse.json({ error: "Course not found." }, { status: 404 });
  if (course.tier === "PAID") {
    return NextResponse.json({ error: "Paid enrollment is unavailable until payment processing is configured. No payment has been taken." }, { status: 503 });
  }
  const existing = await prisma.courseEnrollment.findUnique({
    where: { userId_courseId: { userId: session.sub, courseId: id } },
  });
  if (existing) return NextResponse.json({ enrollment: existing, alreadyEnrolled: true });

  try {
    const enrollment = await prisma.$transaction(async (tx) => {
      const created = await tx.courseEnrollment.create({ data: { userId: session.sub, courseId: id } });
      await tx.xpLog.create({ data: { userId: session.sub, amount: 10, reason: `Course enrollment: ${course.title}`, itemId: id, itemType: "course" } });
      await tx.studentProfile.update({ where: { userId: session.sub }, data: { xp: { increment: 10 }, lastActive: new Date() } });
      return created;
    });
    return NextResponse.json({ enrollment }, { status: 201 });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      const enrollment = await prisma.courseEnrollment.findUnique({ where: { userId_courseId: { userId: session.sub, courseId: id } } });
      return NextResponse.json({ enrollment, alreadyEnrolled: true });
    }
    throw error;
  }
}
