import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { setAuthCookie } from "@/lib/auth";
import { jsonError, parseBody } from "@/lib/http";
import { credentialsSchema } from "@/lib/validators";

export async function POST(req: Request) {
  const body = await parseBody(req, credentialsSchema);
  if (!body.ok) return body.res;
  const { email, password } = body.data;

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user || !(await compare(password, user.passwordHash))) return jsonError("Incorrect email or password", 401);

  await setAuthCookie({ id: user.id, email: user.email });
  return NextResponse.json({ user: { id: user.id, email: user.email } });
}
