"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Client, Account } from "appwrite";
import { usePathname } from "next/navigation";
import { signOut } from "../lib/appwrite";

interface AppwriteUser {
  $id?: string;
  name?: string;
  email?: string;
}

export default function Navbar() {
  // Get current route
  const pathname = usePathname();

  // Hide Navbar on sign in/up pages
  if (pathname === "/signin" || pathname === "/signup") {
    return null;
  }

  const [user, setUser] = useState<AppwriteUser | null>(null);

  useEffect(() => {
    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_AW_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_AW_PROJECT_ID!);
    const account = new Account(client);

    account
      .get()
      .then((userData: AppwriteUser) => {
        setUser(userData);
      })
      .catch(() => {
        setUser(null);
      });
  }, []);

  return (
    <nav className="flex justify-between items-center p-4 bg-white/10 backdrop-blur-md border-b border-white/20">
      <div className="flex items-center space-x-4">
        {/* Home Icon */}
        <Link href="/">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-pink-500 hover:text-pink-400 transition-colors"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10l9-7 9 7v11a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-4H9v4a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V10z"
            />
          </svg>
        </Link>
        {user && (
          <span className="text-gray-300">
            Welcome, {user.name || user.email}
          </span>
        )}
      </div>
      <div>
        {user ? (
          <form action={signOut}>
            <button
              type="submit"
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-2 px-4 rounded transition"
            >
              Logout
            </button>
          </form>
        ) : (
          <div className="flex space-x-4">
            <Link
              href="/signin"
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-2 px-4 rounded transition"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-2 px-4 rounded transition"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
);
}
