import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { accounts, emails } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { jsonError, parseBody, unauthorized } from "@/lib/http";
import { createAccountSchema } from "@/lib/validators";

const accountColumns = {
  id: accounts.id,
  emailId: accounts.emailId,
  emailAddress: emails.address,
  name: accounts.name,
  quotaPercent: accounts.quotaPercent,
  resetAt: accounts.resetAt,
  createdAt: accounts.createdAt,
  updatedAt: accounts.updatedAt,
};

export async function GET() {
  const user = await getSession();
  if (!user) return unauthorized();
  const rows = await db
    .select(accountColumns)
    .from(accounts)
    .innerJoin(emails, eq(accounts.emailId, emails.id))
    .where(eq(accounts.userId, user.id));
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const user = await getSession();
  if (!user) return unauthorized();
  const body = await parseBody(req, createAccountSchema);
  if (!body.ok) return body.res;
  const d = body.data;

  const [email] = await db
    .select({ id: emails.id })
    .from(emails)
    .where(and(eq(emails.id, d.emailId), eq(emails.userId, user.id)))
    .limit(1);
  if (!email) return jsonError("Email not found", 404);

  const [row] = await db
    .insert(accounts)
    .values({
      userId: user.id,
      emailId: d.emailId,
      name: d.name,
      quotaPercent: d.quotaPercent ?? null,
      resetAt: d.resetAt ? new Date(d.resetAt) : null,
    })
    .returning();
  return NextResponse.json(row, { status: 201 });
}
