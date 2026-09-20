import { NextResponse } from "next/server";
import { prisma } from "@tuiton/db";
import { getSession } from "@/lib/session";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { classId } = await params;
  const cls = await prisma.liveClass.findUnique({
    where: { id: classId },
    include: {
      roadmap: { select: { title: true, color: true } },
      _count: { select: { attendance: true, chat: true } },
    },
  });

  if (!cls) return NextResponse.json({ error: "Class not found" }, { status: 404 });

  return NextResponse.json({
    id: cls.id,
    title: cls.title,
    description: cls.description,
    hostName: cls.hostName,
    startsAt: cls.startsAt.toISOString(),
    durationMin: cls.durationMin,
    roomName: cls.roomName,
    status: cls.status,
    roadmap: cls.roadmap,
    _count: cls._count,
  });
}