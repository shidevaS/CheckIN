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
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") || "50");

  const messages = await prisma.classChat.findMany({
    where: { classId },
    orderBy: { createdAt: "asc" },
    take: limit,
    include: { user: { select: { id: true, name: true } } },
  });

  return NextResponse.json({
    messages: messages.map((m) => ({
      id: m.id,
      body: m.body,
      kind: m.kind,
      createdAt: m.createdAt.toISOString(),
      user: m.user,
    })),
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { classId } = await params;
  const body = await req.json();
  const { body: message, kind = "CHAT" } = body;

  if (!message?.trim()) {
    return NextResponse.json({ error: "Message required" }, { status: 400 });
  }

  const msg = await prisma.classChat.create({
    data: {
      classId,
      userId: session.sub,
      body: message,
      kind,
    },
    include: { user: { select: { id: true, name: true } } },
  });

  return NextResponse.json({
    id: msg.id,
    body: msg.body,
    kind: msg.kind,
    createdAt: msg.createdAt.toISOString(),
    user: msg.user,
  });
}