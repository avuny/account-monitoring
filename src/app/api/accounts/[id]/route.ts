import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { accounts } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { isUuid, jsonError, parseBody, unauthorized } from "@/lib/http";
import { updateAccountSchema } from "@/lib/validators";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  const user = await getSession();
  if (!user) return unauthorized();
  const { id } = await params;
  if (!isUuid(id)) return jsonError("Account not found", 404);
  const body = await parseBody(req, updateAccountSchema);
  if (!body.ok) return body.res;
  const d = body.data;

  const patch: Partial<typeof accounts.$inferInsert> = { updatedAt: new Date() };
  if (d.name !== undefined) patch.name = d.name;
  if (d.quotaPercent !== undefined) patch.quotaPercent = d.quotaPercent;
  if (d.resetAt !== undefined) patch.resetAt = d.resetAt ? new Date(d.resetAt) : null;

  const [row] = await db
    .update(accounts)
    .set(patch)
    .where(and(eq(accounts.id, id), eq(accounts.userId, user.id)))
    .returning();
  if (!row) return jsonError("Account not found", 404);
  return NextResponse.json(row);
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const user = await getSession();
  if (!user) return unauthorized();
  const { id } = await params;
  if (!isUuid(id)) return jsonError("Account not found", 404);

  const rows = await db
    .delete(accounts)
    .where(and(eq(accounts.id, id), eq(accounts.userId, user.id)))
    .returning({ id: accounts.id });
  if (rows.length === 0) return jsonError("Account not found", 404);
  return NextResponse.json({ ok: true });
}
