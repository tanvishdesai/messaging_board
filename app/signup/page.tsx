"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Client, Account, ID } from "appwrite";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [enrollmentNo, setEnrollmentNo] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // NEW loading state
  const router = useRouter();

  // Initialize the Appwrite client
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_AW_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_AW_PROJECT_ID!);
  const account = new Account(client);

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true); // start loading
    try {
      // Create the user account
      await account.create(ID.unique(), email, password, name);

      // Automatically sign in the user so we can update preferences
      await account.createEmailPasswordSession(email, password);

      // Update user preferences with the enrollment number
      await account.updatePrefs({ enrollmentNo });

      router.push("/");
    } catch (err: unknown) {
      console.error(err);
      setError("Failed to sign up. Please try again.");
    } finally {
      setLoading(false); // stop loading regardless of outcome
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#1f1b2e] via-[#1a1822] to-black p-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 rounded-lg shadow-xl p-6">
        <h1 className="text-2xl md:text-3xl font-extrabold mb-4 text-center text-pink-300">
          Sign Up
        </h1>
        {error && <p className="mb-4 text-red-500">{error}</p>}
        <form onSubmit={handleSignUp} className="space-y-4">
          <input
            id="email"
            name="email"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-2 bg-transparent border border-white/30 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <input
            id="password"
            name="password"
            placeholder="Password"
            minLength={8}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-2 bg-transparent border border-white/30 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <input
            id="name"
            name="name"
            placeholder="Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full p-2 bg-transparent border border-white/30 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          {/* Enrollment Number Field */}
          <input
            id="enrollmentNo"
            name="enrollmentNo"
            placeholder="Enrollment Number"
            type="text"
            value={enrollmentNo}
            onChange={(e) => setEnrollmentNo(e.target.value)}
            required
            className="w-full p-2 bg-transparent border border-white/30 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <button
            type="submit"
            disabled={loading} // disable while loading
            className="w-full py-2 px-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-md hover:from-pink-700 hover:to-purple-700 transition"
          >
            {loading ? "Signing up..." : "Sign Up"} {/* change text based on loading */}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-400">
          Already have an account?{" "}
          <a href="/signin" className="text-pink-500 hover:underline">
            Sign in here
          </a>
        </p>
      </div>
    </div>
  );
}
