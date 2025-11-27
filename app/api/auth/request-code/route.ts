import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
}

export async function POST(req: Request) {
  const { email, firstName, lastName } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const code = generateCode();
  const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  await prisma.loginCode.create({
    data: {
      email,
      firstName,
      lastName,
      code,
      expires,
    },
  });

  // For now we just return the code in the response (and optionally log it)
  console.log(`Login code for ${email}: ${code}`);

  return NextResponse.json({ ok: true, code });
}