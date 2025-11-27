import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");

  if (!q) {
    return NextResponse.json({ Search: [] });
  }

  if (!process.env.OMDB_API_KEY) {
    return NextResponse.json(
      { error: "OMDB_API_KEY is missing" },
      { status: 500 }
    );
  }

  try {
    const omdbRes = await fetch(
      `http://www.omdbapi.com/?i=tt3896198&apikey=${process.env.OMDB_API_KEY}&s=${encodeURIComponent(
        q
      )}`
    );

    const data = await omdbRes.json();
    console.log("OMDb response:", data);

    return NextResponse.json(data);
  } catch (err) {
    console.error("OMDb fetch failed:", err);
    return NextResponse.json(
      { error: "Failed to reach OMDb" },
      { status: 500 }
    );
  }
}