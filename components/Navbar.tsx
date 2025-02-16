// src/components/Navbar.tsx
"use client";

import React from "react";
import { signOut } from "../lib/appwrite";

interface NavbarProps {
  username: string;
}

export default function Navbar({ username }: NavbarProps) {
  return (
    <nav className="flex justify-between items-center p-4 bg-gray-800 text-white">
      <div>
        <span>Welcome, {username}</span>
      </div>
      <div>
        {/* When the form is submitted, the server action `signOut` is invoked */}
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
