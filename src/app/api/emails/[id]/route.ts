import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { emails } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { isUuid, jsonError, unauthorized } from "@/lib/http";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) return unauthorized();
  const { id } = await params;
  if (!isUuid(id)) return jsonError("Email not found", 404);

  // Accounts under this email are removed by the foreign key cascade.
  const rows = await db
    .delete(emails)
    .where(and(eq(emails.id, id), eq(emails.userId, user.id)))
    .returning({ id: emails.id });
  if (rows.length === 0) return jsonError("Email not found", 404);
  return NextResponse.json({ ok: true });
}
