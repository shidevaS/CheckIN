import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@tuiton/db";
import { getSession } from "@/lib/session";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // Delete comments first (cascade doesn't work on raw SQL well)
  await prisma.forumComment.deleteMany({ where: { topicId: id } });
  await prisma.forumTopic.delete({ where: { id } });

  return NextResponse.json({ success: true });
}