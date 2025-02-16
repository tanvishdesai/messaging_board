// src/lib/server/appwrite.js
"use server";
import { Client, Account } from "node-appwrite";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function createSessionClient() {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_AW_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_AW_PROJECT_ID!);

  const session = await (await cookies()).get("my-custom-session");
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
  } catch (error) {
    return null;
  }
}

export async function signOut() {
  try {
    const cookieStore = cookies();
    const session = (await cookieStore).get("my-custom-session");

    // If there's no session cookie, simply redirect
    if (!session || !session.value) {
      redirect("/signin");
      return;
    }

    const { account } = await createSessionClient();
    await account.deleteSession("current");
    (await cookieStore).delete("my-custom-session");
    redirect("/signin");
  } catch (error) {
    console.error("Error signing out:", error);
    // In case of error, still redirect to sign in
    redirect("/signin");
  }
}