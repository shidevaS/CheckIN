import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@tuiton/db";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const topics = await prisma.forumTopic.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      user: { select: { id: true, name: true } },
      _count: { select: { comments: true } },
    },
  });

  // Add likeCount field (defaults to 0 for now)
  const topicsWithLikes = topics.map(topic => ({
    ...topic,
    likeCount: 0,
  }));

  return NextResponse.json(topicsWithLikes);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, body: content, tag } = body;

  if (!title?.trim() || !content?.trim()) {
    return NextResponse.json({ error: "Title and body are required" }, { status: 400 });
  }

  const topic = await prisma.forumTopic.create({
    data: {
      userId: session.sub,
      title: title.trim(),
      body: content.trim(),
      tag: tag || "general",
    },
    include: {
      user: { select: { id: true, name: true } },
      _count: { select: { comments: true } },
    },
  });
  return NextResponse.json(topic);
}