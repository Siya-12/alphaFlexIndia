"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const callbackUrl =
    searchParams.get("callbackUrl") ||
    "/checkout";

  const [firstName, setFirstName] =
    useState("");

  const [lastName, setLastName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      // 1. Create user
      const response = await fetch(
        "/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            firstName,
            lastName,
            email,
            phone,
            password,
          }),
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Registration failed"
        );
      }

      // 2. Login immediately
      const loginResult =
        await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

      if (
        !loginResult ||
        loginResult.error
      ) {
        throw new Error(
          "Account created, but login failed"
        );
      }

      // 3. Redirect
      router.push(callbackUrl);
      router.refresh();

    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-6"
    >
      <h1 className="text-3xl font-bold mb-6">
        Create Account
      </h1>

      <input
        placeholder="First Name"
        value={firstName}
        onChange={(e) =>
          setFirstName(e.target.value)
        }
        className="w-full border p-3 mb-3"
        required
      />

      <input
        placeholder="Last Name"
        value={lastName}
        onChange={(e) =>
          setLastName(e.target.value)
        }
        className="w-full border p-3 mb-3"
      />

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) =>
          setEmail(e.target.value)
        }
        className="w-full border p-3 mb-3"
        required
      />

      <input
        type="tel"
        placeholder="Phone"
        value={phone}
        onChange={(e) =>
          setPhone(e.target.value)
        }
        className="w-full border p-3 mb-3"
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) =>
          setPassword(e.target.value)
        }
        className="w-full border p-3 mb-3"
        required
      />

      {error && (
        <p className="text-red-600 mb-3">
          {error}
        </p>
      )}

      <button
        disabled={loading}
        className="w-full bg-black text-white p-3 rounded"
      >
        {loading
          ? "Creating..."
          : "Create Account"}
      </button>
    </form>
  );
}