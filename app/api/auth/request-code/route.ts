import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
  const { email, firstName, lastName } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const code = generateCode();
  const expires = new Date(Date.now() + 15 * 60 * 1000); 

  await prisma.loginCode.create({
    data: {
      email,
      firstName,
      lastName,
      code,
      expires,
    },
  });

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error("Missing SMTP_USER or SMTP_PASS");
    return NextResponse.json(
      { error: "Email service not configured" },
      { status: 500 }
    );
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM ?? process.env.SMTP_USER,
      to: email,
      subject: "Your login code for My Movie Lists",
      text: `Hi${firstName ? " " + firstName : ""},

Here is your login code:

${code}

It expires in 15 minutes.

If you didn’t request this, you can ignore this email.`,
    });
  } catch (err) {
    console.error("Error sending email", err);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}