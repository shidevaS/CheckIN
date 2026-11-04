import { NextResponse } from "next/server";
import { prisma } from "@tuiton/db";
import { getSession } from "@/lib/session";

/**
 * Wishlist API - Save and manage courses for later
 * 
 * Endpoints:
 * - GET /api/wishlist - Get user's wishlist
 * - POST /api/wishlist - Add a course to wishlist
 * - DELETE /api/wishlist/[id] - Remove from wishlist
 */

// GET - Get user's wishlist
export async function GET(
  req: Request
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const wishlist = await prisma.wishlist.findMany({
    where: { userId: session.sub },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          slug: true,
          kind: true,
          tier: true,
          subjectArea: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(wishlist.map((item: any) => item.course));
}

// POST - Add a course to wishlist
export async function POST(
  req: Request,
  { params }: { params: Promise<{ }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { courseId } = body;

  if (!courseId) {
    return NextResponse.json({ error: "courseId is required" }, { status: 400 });
  }

  // Check if course exists
  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  // Check if already in wishlist
  const existing = await prisma.wishlist.findUnique({
    where: { userId_courseId: { userId: session.sub, courseId } },
  });

  if (existing) {
    return NextResponse.json({ error: "Already in wishlist" }, { status: 400 });
  }

  const wishlistItem = await prisma.wishlist.create({
    data: {
      userId: session.sub,
      courseId,
    },
  });

  return NextResponse.json(wishlistItem, { status: 201 });
}

// DELETE - Remove from wishlist
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const wishlistItem = await prisma.wishlist.findUnique({
    where: { id },
  });

  if (!wishlistItem || wishlistItem.userId !== session.sub) {
    return NextResponse.json({ error: "Not found or not your wishlist item" }, { status: 404 });
  }

  await prisma.wishlist.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}