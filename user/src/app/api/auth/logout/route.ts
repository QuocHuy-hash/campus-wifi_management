import { NextResponse } from "next/server";
import { AUTH_COOKIE_KEY } from "@/constants/appKeys";

export async function POST() {
  const response = NextResponse.json(
    { code: 200, message: "Logged out" },
    { status: 200 }
  );

  response.cookies.set(AUTH_COOKIE_KEY, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
