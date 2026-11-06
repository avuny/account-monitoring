import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
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

  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing) return jsonError("An account with this email already exists", 409);

  const passwordHash = await hash(password, 10);
  const [user] = await db.insert(users).values({ email, passwordHash }).returning({ id: users.id, email: users.email });
  await setAuthCookie(user);
  return NextResponse.json({ user }, { status: 201 });
}
