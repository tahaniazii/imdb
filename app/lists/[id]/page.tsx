import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

type ListPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PublicListPage(props: ListPageProps) {
  const { id } = await props.params;

  const list = await prisma.list.findUnique({
    where: { id },
    include: {
      owner: true,
      items: {
        include: { movie: true },
      },
    },
  });

  if (!list || !list.isPublic) {
    notFound();
  }

  return (
    <div className="min-h-screen p-8 space-y-4">
      <h1 className="text-2xl font-semibold">{list.name}</h1>
      <p className="text-sm text-zinc-600">
        Created by {list.owner?.name ?? list.owner?.email}
      </p>

      {list.items.length === 0 ? (
        <p className="text-zinc-600 mt-4">
          There are no movies in this list yet.
        </p>
      ) : (
        <ul className="space-y-3 mt-4">
          {list.items.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-3 border rounded-md p-3"
            >
              {item.movie.posterUrl && (
                <img
                  src={item.movie.posterUrl}
                  alt={item.movie.title}
                  className="w-12 h-18 object-cover rounded"
                />
              )}
              <div>
                <div className="font-semibold">{item.movie.title}</div>
                <div className="text-sm text-zinc-600">
                  {item.movie.year ?? ""}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}