"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";

export default function SignInPage() {
  const [step, setStep] = useState<"request" | "verify">("request");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRequest(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/auth/request-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName, lastName, email }),
    });
    setLoading(false);

    if (!res.ok) {
        const data = await res.json().catch(() => null);
        alert(data?.error ?? "Could not send code.");
        return;
    }

    setStep("verify");
  }

  async function handleVerify(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    const result = await signIn("email-code", {
      email,
      code,
      redirect: true,
      callbackUrl: "/",
    });
    setLoading(false);

    if (result?.error) {
      alert("Invalid or expired code.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="w-full max-w-md rounded-xl border bg-white p-6 space-y-4">
        {step === "request" ? (
          <>
            <h1 className="text-xl font-semibold">Sign up / Sign in</h1>
            <p className="text-sm text-zinc-600">
              Enter your name and email. We’ll send you a 6-digit code.
            </p>
            <form onSubmit={handleRequest} className="space-y-3">
              <input
                className="w-full border rounded-md px-3 py-2"
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <input
                className="w-full border rounded-md px-3 py-2"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
              <input
                className="w-full border rounded-md px-3 py-2"
                placeholder="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button
                type="submit"
                className="w-full rounded-md bg-black text-white py-2 text-sm"
                disabled={loading}
              >
                {loading ? "Sending code..." : "Send code"}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="text-xl font-semibold">Enter your code</h1>
            <p className="text-sm text-zinc-600">
              We sent a 6-digit code to <strong>{email}</strong>. Check your
              email (or terminal while testing).
            </p>
            <form onSubmit={handleVerify} className="space-y-3">
              <input
                className="w-full border rounded-md px-3 py-2 tracking-widest text-center"
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <button
                type="submit"
                className="w-full rounded-md bg-black text-white py-2 text-sm"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Verify & continue"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}