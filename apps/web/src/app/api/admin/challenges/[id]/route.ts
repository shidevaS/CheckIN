import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@tuiton/db";
import { getSession } from "@/lib/session";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const challenge = await prisma.challenge.findUnique({ where: { id } });
  if (!challenge) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.challenge.update({
    where: { id },
    data: {
      kind: body.kind ?? challenge.kind,
      title: body.title?.trim() ?? challenge.title,
      prompt: body.prompt?.trim() ?? challenge.prompt,
      cadence: body.cadence ?? challenge.cadence,
      difficulty: body.difficulty ?? challenge.difficulty,
      strand: body.strand?.trim() ?? challenge.strand,
      options: body.options ? JSON.stringify(body.options) : challenge.options,
      answer: body.answer?.trim() ?? challenge.answer,
      starter: body.starter?.trim() ?? challenge.starter,
      xp: body.xp ?? challenge.xp,
      dayKey: body.dayKey ?? challenge.dayKey,
      weekKey: body.weekKey ?? challenge.weekKey,
      monthKey: body.monthKey?.trim() ?? challenge.monthKey,
      startsAt: body.startsAt ? new Date(body.startsAt) : challenge.startsAt,
      endsAt: body.endsAt ? new Date(body.endsAt) : challenge.endsAt,
      published: body.published ?? challenge.published,
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.challenge.delete({ where: { id } });
  return NextResponse.json({ success: true });
}