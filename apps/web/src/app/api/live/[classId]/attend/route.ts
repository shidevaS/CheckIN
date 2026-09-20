import { NextResponse } from "next/server";
import { prisma } from "@tuiton/db";
import { getSession } from "@/lib/session";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { classId } = await params;

  const existing = await prisma.classAttendance.findUnique({
    where: { classId_userId: { classId, userId: session.sub } },
  });

  if (!existing) {
    await prisma.classAttendance.create({
      data: { classId, userId: session.sub },
    });
  }

  return NextResponse.json({ ok: true, joined: true });
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { classId } = await params;
  const existing = await prisma.classAttendance.findUnique({
    where: { classId_userId: { classId, userId: session.sub } },
  });

  return NextResponse.json({ joined: !!existing });
}