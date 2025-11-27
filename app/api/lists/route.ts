import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authConfig);
  if (!session?.user?.email) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { lists: true },
  });

  return NextResponse.json(user?.lists ?? []);
}

export async function POST(req: Request) {
  const session = await getServerSession(authConfig);
  if (!session?.user?.email) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = await req.json();
  const { name, isPublic = true } = body;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) return new NextResponse("User not found", { status: 404 });

  const list = await prisma.list.create({
    data: {
      name,
      isPublic,
      ownerId: user.id,
    },
  });

  return NextResponse.json(list);
}