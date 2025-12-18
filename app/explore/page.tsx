import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function ExplorePage() {
  const lists = await prisma.list.findMany({
    where: { isPublic: true },
    include: { owner: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen p-8 space-y-4">
      <h1 className="text-2xl font-semibold">Explore public watchlists</h1>
      <p className="text-sm text-zinc-600">
        Anyone can view these lists. Create your own on the home page.
      </p>

      {lists.length === 0 ? (
        <p className="text-zinc-600 mt-4">
          No public lists yet. Be the first to create one!
        </p>
      ) : (
        <ul className="space-y-3 mt-4">
          {lists.map((list) => (
            <li key={list.id}>
              <Link
                href={`/lists/${list.id}`}
                className="text-blue-600 underline"
              >
                {list.name}
              </Link>{" "}
              <span className="text-xs text-zinc-600">
                by {list.owner?.name ?? list.owner?.email}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}