import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@tuiton/db";
import { getSession } from "@/lib/session";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { body: content } = body;

  if (!content?.trim()) {
    return NextResponse.json({ error: "Comment body is required" }, { status: 400 });
  }

  const topic = await prisma.forumTopic.findUnique({ where: { id } });
  if (!topic) {
    return NextResponse.json({ error: "Topic not found" }, { status: 404 });
  }

  const comment = await prisma.forumComment.create({
    data: {
      topicId: id,
      userId: session.sub,
      body: content.trim(),
    },
    include: {
      user: { select: { id: true, name: true } },
    },
  });

  // Create notification for topic author (if not self)
  if (topic.userId !== session.sub) {
    await prisma.notification.create({
      data: {
        userId: topic.userId,
        type: "comment",
        title: "New comment on your topic",
        body: `${session.name} replied to "${topic.title}"`,
        href: `/community#topic-${id}`,
      },
    });
  }

  return NextResponse.json(comment);
}