import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@tuiton/db";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const projects = await prisma.project.findMany({
    where: { userId: session.sub },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, summary, type, link } = body;

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const project = await prisma.project.create({
    data: {
      userId: session.sub,
      title: title.trim(),
      summary: summary?.trim() || "",
      type: type || "ai-agent",
      link: link?.trim() || null,
    },
  });
  return NextResponse.json(project);
}