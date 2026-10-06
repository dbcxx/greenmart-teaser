"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, safeEqual, sessionToken } from "@/lib/admin-auth";

export async function login(_prev: string | null, form: FormData): Promise<string | null> {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return "Set ADMIN_PASSWORD first.";
  const given = String(form.get("password") ?? "");
  if (!safeEqual(given, password)) {
    // Slow down guessing.
    await new Promise((r) => setTimeout(r, 800));
    return "Wrong password.";
  }
  (await cookies()).set(ADMIN_COOKIE, sessionToken(password), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: 60 * 60 * 12,
  });
  redirect("/admin");
}

export async function logout() {
  (await cookies()).delete({ name: ADMIN_COOKIE, path: "/admin" });
  redirect("/admin");
}
