import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_KEY } from "@/constants/appKeys";

const COOKIE_MAX_AGE = 60 * 60; // 1 hour

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3030/api/v1";

async function validateToken(token: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(5000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_KEY)?.value;

  if (!token) {
    return NextResponse.json(
      { authenticated: false },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  const authenticated = await validateToken(token);

  if (!authenticated) {
    const response = NextResponse.json(
      { authenticated: false },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
    response.cookies.set(AUTH_COOKIE_KEY, "", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    return response;
  }

  return NextResponse.json(
    { authenticated: true },
    { status: 200, headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accessToken } = body;

    if (!accessToken) {
      return NextResponse.json(
        { code: 400, message: "Missing accessToken" },
        { status: 400 }
      );
    }

    const isProduction = process.env.NODE_ENV === "production";
    const response = NextResponse.json(
      { code: 200, message: "Session established" },
      { status: 200 }
    );

    response.cookies.set(AUTH_COOKIE_KEY, accessToken, {
      httpOnly: false,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: COOKIE_MAX_AGE,
    });

    return response;
  } catch {
    return NextResponse.json(
      { code: 500, message: "Failed to set session" },
      { status: 500 }
    );
  }
}
