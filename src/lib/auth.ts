import { cookies } from "next/headers";
import { AUTH_COOKIE, createAccessToken, TOKEN_TTL_SECONDS, verifyAccessToken, type SessionUser } from "./jwt";

export async function setAuthCookie(user: SessionUser) {
  const token = await createAccessToken(user);
  (await cookies()).set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TOKEN_TTL_SECONDS,
  });
}

export async function clearAuthCookie() {
  (await cookies()).delete(AUTH_COOKIE);
}

export async function getSession(): Promise<SessionUser | null> {
  const token = (await cookies()).get(AUTH_COOKIE)?.value;
  return token ? verifyAccessToken(token) : null;
}
