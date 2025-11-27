"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

type List = {
  id: string;
  name: string;
  isPublic: boolean;
};

export default function MyListsPage() {
  const { data: session, status } = useSession();
  const [lists, setLists] = useState<List[]>([]);
  const [loadingLists, setLoadingLists] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/lists")
        .then((res) => res.json())
        .then((data) => {
          setLists(data);
        })
        .catch((err) => {
          console.error("Failed to load lists", err);
        })
        .finally(() => {
          setLoadingLists(false);
        });
    } else if (status === "unauthenticated") {
      setLoadingLists(false);
    }
  }, [status]);

  if (status === "loading" || loadingLists) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading…</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    if (typeof window !== "undefined") {
      window.location.href = "/auth/signin";
    }
    return null;
  }

  return (
    <div className="min-h-screen p-8 space-y-4">
      <h1 className="text-2xl font-semibold">My watchlists</h1>
      <p className="text-sm text-zinc-600">
        Signed in as {session?.user?.email}
      </p>

      {lists.length === 0 ? (
        <p className="text-zinc-600">You don’t have any lists yet.</p>
      ) : (
        <ul className="space-y-2">
          {lists.map((list) => (
            <li key={list.id}>
              <a
                href={`/lists/${list.id}`}
                className="text-blue-600 underline"
              >
                {list.name}
              </a>{" "}
              {list.isPublic ? (
                <span className="text-xs text-green-600">(public)</span>
              ) : (
                <span className="text-xs text-zinc-500">(private)</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}