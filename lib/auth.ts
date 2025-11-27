import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const authConfig: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      id: "email-code",
      name: "Email code",
      credentials: {
        email: { label: "Email", type: "text" },
        code: { label: "Code", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.code) return null;

        const now = new Date();

        const record = await prisma.loginCode.findFirst({
          where: {
            email: credentials.email,
            used: false,
            expires: { gt: now },
          },
          orderBy: { createdAt: "desc" },
        });

        if (!record) return null;
        if (record.code !== credentials.code) return null;

        await prisma.loginCode.update({
          where: { id: record.id },
          data: { used: true },
        });

        let user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        const fullName = [record.firstName, record.lastName]
          .filter(Boolean)
          .join(" ")
          .trim();

        if (!user) {
          user = await prisma.user.create({
            data: {
              email: record.email,
              name: fullName || undefined,
            },
          });
        } else if (!user.name && fullName) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: { name: fullName },
          });
        }

        return { id: user.id, email: user.email!, name: user.name ?? undefined };
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
};