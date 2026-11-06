import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { emails } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { jsonError, parseBody, unauthorized } from "@/lib/http";
import { addEmailSchema } from "@/lib/validators";

export async function GET() {
  const user = await getSession();
  if (!user) return unauthorized();
  const rows = await db.select().from(emails).where(eq(emails.userId, user.id)).orderBy(asc(emails.address));
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const user = await getSession();
  if (!user) return unauthorized();
  const body = await parseBody(req, addEmailSchema);
  if (!body.ok) return body.res;

  const [row] = await db
    .insert(emails)
    .values({ userId: user.id, address: body.data.address })
    .onConflictDoNothing()
    .returning();
  if (!row) return jsonError("This email is already in your list", 409);
  return NextResponse.json(row, { status: 201 });
}
