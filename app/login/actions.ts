"use server";

import { signIn } from "@/lib/auth/config";
import { redirect } from "next/navigation";

export async function authenticate(credentials: { username: string; password: string }) {
  try {
    const result = await signIn("credentials", {
      username: credentials.username,
      password: credentials.password,
      redirect: false,
    });
    
    if (result) {
      redirect("/dashboard");
    } else {
      return { error: "Invalid credentials" };
    }
  } catch (error) {
    console.error("Authentication error:", error);
    return { error: "Authentication failed" };
  }
}