"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Client, Account } from "appwrite";
import { signOut } from "../lib/appwrite";

interface AppwriteUser {
  $id?: string;
  name?: string;
  email?: string;
}

export default function Navbar() {
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

  const username = user?.name || user?.email || "User";

  return (
    <nav className="flex justify-between items-center p-4 bg-gray-800 text-white">
      <div className="flex items-center space-x-4">
        {/* Home Icon */}
        <Link href="/">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-white hover:text-gray-300 transition-colors"
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
        <span>Welcome, {username}</span>
      </div>
      <div>
        <form action={signOut}>
          <button
            type="submit"
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
          >
            Logout
          </button>
        </form>
      </div>
    </nav>
  );
}
