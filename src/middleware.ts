import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE, verifyAccessToken } from "@/lib/jwt";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get(AUTH_COOKIE)?.value;
  const user = token ? await verifyAccessToken(token) : null;
  const { pathname } = req.nextUrl;
  const isAuthPage = pathname === "/login" || pathname === "/signup";

  if (!user && !isAuthPage) return NextResponse.redirect(new URL("/login", req.url));
  if (user && isAuthPage) return NextResponse.redirect(new URL("/dashboard", req.url));
  return NextResponse.next();
}

export const config = { matcher: ["/", "/dashboard/:path*", "/emails/:path*", "/login", "/signup"] };
