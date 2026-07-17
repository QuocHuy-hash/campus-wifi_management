import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_KEY } from "@/constants/appKeys";

const COOKIE_MAX_AGE = 60 * 60; // 1 hour

export async function GET(request: NextRequest) {
  const authenticated = Boolean(
    request.cookies.get(AUTH_COOKIE_KEY)?.value,
  );

  return NextResponse.json(
    { authenticated },
    {
      status: authenticated ? 200 : 401,
      headers: { "Cache-Control": "no-store" },
    },
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
      httpOnly: true,
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
