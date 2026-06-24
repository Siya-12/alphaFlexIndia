"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      alert("Invalid credentials");
      return;
    }

    router.push("/");
    router.refresh();
  }

 return (
  <div className="min-h-screen flex items-center justify-center">
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md border rounded-lg p-6 shadow"
    >
      <h1 className="text-2xl font-bold mb-4">Login</h1>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full border p-3 rounded mb-3"
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full border p-3 rounded mb-4"
      />

      <button
        type="submit"
        className="w-full bg-blue-700 text-white p-3 rounded"
      >
        Login
      </button>
      <p className="text-center mt-4">
        Don't have an account?{" "}
        <Link
            href="/signup"
            className="text-blue-700 font-medium hover:underline"
        >
            Sign Up
        </Link>
        </p>
    </form>
  </div>
);
}