// src/lib/server/appwrite.js
"use server";
import { Client, Account } from "node-appwrite";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function createSessionClient() {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_AW_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_AW_PROJECT_ID!);

  const cookieStore = await cookies();
  const session = cookieStore.get("my-custom-session");
  if (!session || !session.value) {
    throw new Error("No session");
  }

  client.setSession(session.value);

  return {
    get account() {
      return new Account(client);
    },
  };
}


export async function createAdminClient() {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_AW_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_AW_PROJECT_ID!)
    .setKey(process.env.NEXT_APPWRITE_KEY!);

  return {
    get account() {
      return new Account(client);
    },
  };
}

export async function getLoggedInUser() {
  try {
    const { account } = await createSessionClient();
    return await account.get();
  } catch {
    return null;
  }
}

export async function signOut() {
  // Since cookies() returns a Promise, we need to await it
  const cookieStore = await cookies();
  const session = cookieStore.get("my-custom-session");

  // Early return with redirect if no session exists
  if (!session || !session.value) {
    redirect("/signin");
  }

  try {
    // Initialize Appwrite client and delete the session
    const { account } = await createSessionClient();
    await account.deleteSession("current");
    
    // Delete the cookie
    cookieStore.delete("my-custom-session");
    
    // Redirect to signin page
    redirect("/signin");
  } catch (error) {
    // It's good practice to handle potential errors when working with external services
    console.error("Error during sign out:", error);
    throw error; // Or handle the error according to your application's needs
  }
}