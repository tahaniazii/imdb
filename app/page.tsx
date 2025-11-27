"use client";

import { FormEvent, useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

type OmdbMovie = {
  imdbID: string;
  Title: string;
  Year: string;
  Poster: string;
};

type List = {
  id: string;
  name: string;
};

export default function Home() {
  const { data: session, status } = useSession();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<OmdbMovie[]>([]);
  const [loading, setLoading] = useState(false);
  const [lists, setLists] = useState<List[]>([]);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/lists")
        .then((res) => res.json())
        .then((data) => {
          setLists(data);
          if (data.length > 0 && !selectedListId) {
            setSelectedListId(data[0].id);
          }
        })
        .catch((err) => console.error("Failed to load lists", err));
    }
  }, [status]);

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResults([]);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.Response === "False") {
        alert(data.Error ?? "No results");
        return;
      }
      setResults(data.Search || []);
    } catch (err) {
      console.error("Search error", err);
      alert("Search failed");
    } finally {
      setLoading(false);
    }
  }

  async function addToList(movie: OmdbMovie) {
    if (!selectedListId) {
      alert("Create or select a list first");
      return;
    }

    await fetch(`/api/lists/${selectedListId}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        omdbId: movie.imdbID,
        title: movie.Title,
        year: movie.Year,
        posterUrl: movie.Poster !== "N/A" ? movie.Poster : null,
      }),
    });

    alert("Added to list!");
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading…</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-3xl font-semibold">🎬 My Movie Lists</h1>
        <p className="text-zinc-600">
          Please sign in with your email to create and view watchlists.
        </p>
        <a
          href="/auth/signin"
          className="rounded-full border px-4 py-2 text-sm"
        >
          Go to sign in
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col items-center py-10 px-4">
      <header className="w-full max-w-3xl flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold">🎬 My Movie Lists</h1>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/lists" className="underline">
           My lists
          </Link>
          <Link href="/explore" className="underline">
           Explore
          </Link>
          <span>{session?.user?.email}</span>
          <button
            className="rounded-full border px-3 py-1"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            Log out
          </button>
        </div>
      </header>

      <main className="w-full max-w-3xl space-y-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a movie or series..."
            className="flex-1 rounded-md border px-3 py-2"
          />
          <button
            type="submit"
            className="rounded-md bg-black text-white px-4 py-2 text-sm"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </form>

        <section className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm">Add to list:</span>
            <select
              className="border rounded-md px-2 py-1 text-sm"
              value={selectedListId ?? ""}
              onChange={(e) =>
                setSelectedListId(e.target.value || null)
              }
            >
              <option value="">-- select list --</option>
              {lists.map((list) => (
                <option key={list.id} value={list.id}>
                  {list.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="text-sm underline"
              onClick={async () => {
                const name = prompt("List name?");
                if (!name) return;
                const res = await fetch("/api/lists", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ name }),
                });
                const newList = await res.json();
                setLists((prev) => [...prev, newList]);
                setSelectedListId(newList.id);
              }}
            >
              + New list
            </button>
          </div>
        </section>

        <section className="grid gap-4">
          {results.map((movie) => (
            <div
              key={movie.imdbID}
              className="flex items-center gap-4 border rounded-lg p-3 bg-white"
            >
              {movie.Poster && movie.Poster !== "N/A" && (
                <img
                  src={movie.Poster}
                  alt={movie.Title}
                  className="w-16 h-24 object-cover rounded-md"
                />
              )}
              <div className="flex-1">
                <div className="font-semibold">{movie.Title}</div>
                <div className="text-sm text-zinc-600">{movie.Year}</div>
              </div>
              <button
                className="text-sm rounded-md border px-3 py-1"
                onClick={() => addToList(movie)}
              >
                Add to list
              </button>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}