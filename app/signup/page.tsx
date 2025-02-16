"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Client, Account, ID } from "appwrite";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [enrollmentNo, setEnrollmentNo] = useState(""); // New state for enrollment number
  const [error, setError] = useState("");
  const router = useRouter();

  // Initialize the Appwrite client
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_AW_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_AW_PROJECT_ID!);

  const account = new Account(client);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      // Create the user account
      await account.create(ID.unique(), email, password, name);

      // Automatically sign in the user so we can update preferences
      await account.createEmailPasswordSession(email, password);

      // Update user preferences with the enrollment number
      await account.updatePrefs({ enrollmentNo });

      // Redirect to home after successful sign up
      router.push("/");
    } catch (err: any) {
      console.error(err);
      setError("Failed to sign up. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">Sign Up</h1>
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
            className="w-full p-2 border border-gray-300 rounded-md"
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
            className="w-full p-2 border border-gray-300 rounded-md"
          />
          <input
            id="name"
            name="name"
            placeholder="Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded-md"
          />
          {/* New Enrollment Number Field */}
          <input
            id="enrollmentNo"
            name="enrollmentNo"
            placeholder="Enrollment Number"
            type="text"
            value={enrollmentNo}
            onChange={(e) => setEnrollmentNo(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded-md"
          />
          <button
            type="submit"
            className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
          >
            Sign Up
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <a href="/signin" className="text-indigo-600 hover:underline">
            Sign in here
          </a>
        </p>
      </div>
    </div>
  );
}
