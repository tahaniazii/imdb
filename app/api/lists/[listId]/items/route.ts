import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  context: { params: Promise<{ listId: string }> }
) {
  // ✅ unwrap params (it's a Promise in new Next.js)
  const { listId } = await context.params;

  const session = await getServerSession(authConfig);
  if (!session?.user?.email) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { omdbId, title, year, posterUrl } = await req.json();

  const list = await prisma.list.findUnique({
    where: { id: listId },
  });
  if (!list) return new NextResponse("List not found", { status: 404 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user || list.ownerId !== user.id) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const movie = await prisma.movie.upsert({
    where: { omdbId },
    update: {},
    create: {
      omdbId,
      title,
      year,
      posterUrl,
    },
  });

  await prisma.listItem.upsert({
    where: {
      listId_movieId: {
        listId: list.id,
        movieId: movie.id,
      },
    },
    update: {},
    create: {
      listId: list.id,
      movieId: movie.id,
    },
  });

  return NextResponse.json({ ok: true });
}