import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authConfig);

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p>You must be signed in to access the dashboard.</p>
        <Link href="/auth/signin" className="underline">
          Go to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">
        Welcome, {session.user?.name || session.user?.email}
      </h1>
      {/* later: movie search, your list, etc. */}
    </div>
  );
}