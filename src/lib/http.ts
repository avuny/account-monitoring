import { NextResponse } from "next/server";
import { z } from "zod";

export const jsonError = (message: string, status: number) => NextResponse.json({ error: message }, { status });
export const unauthorized = () => jsonError("Not signed in", 401);
export const isUuid = (v: string) => z.string().uuid().safeParse(v).success;

export async function parseBody<S extends z.ZodTypeAny>(
  req: Request,
  schema: S,
): Promise<{ ok: true; data: z.infer<S> } | { ok: false; res: NextResponse }> {
  const raw = await req.json().catch(() => null);
  const result = schema.safeParse(raw);
  if (!result.success) return { ok: false, res: jsonError(result.error.issues[0]?.message ?? "Invalid input", 400) };
  return { ok: true, data: result.data };
}
