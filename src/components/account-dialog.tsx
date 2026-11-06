"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/select";
import { Field } from "@/components/field";
import { api, errMsg } from "@/lib/client-api";
import { toLocalInput } from "@/lib/time";
import type { AccountItem, EmailItem } from "@/lib/types";
import { cn } from "@/lib/utils";

export type AccountDialogMode = { type: "create"; emailId?: string } | { type: "edit"; account: AccountItem };

const wholeNumber = (v: string) => v.trim() === "" || /^\d{1,6}$/.test(v.trim());

const schema = z
  .object({
    emailId: z.string().min(1, "Select an email"),
    name: z.string().trim().min(1, "Account name is required").max(100),
    quota: z
      .string()
      .trim()
      .refine((v) => v === "" || (/^\d{1,3}$/.test(v) && Number(v) <= 100), "Enter a whole number from 0 to 100"),
    resetMode: z.enum(["none", "relative", "exact"]),
    days: z.string().refine(wholeNumber, "Use whole numbers"),
    hours: z.string().refine(wholeNumber, "Use whole numbers"),
    minutes: z.string().refine(wholeNumber, "Use whole numbers"),
    exact: z.string(),
  })
  .superRefine((v, ctx) => {
    if (v.resetMode === "relative" && ![v.days, v.hours, v.minutes].some((x) => Number(x) > 0)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["days"], message: "Enter days, hours or minutes" });
    }
    if (v.resetMode === "exact" && (!v.exact || Number.isNaN(new Date(v.exact).getTime()))) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["exact"], message: "Pick a valid date and time" });
    }
  });
type FormValues = z.infer<typeof schema>;

// Relative values are added to "now"; exact values are read as the browser's local time.
function computeResetAt(v: FormValues): string | null {
  if (v.resetMode === "relative") {
    const minutes = (Number(v.days) * 24 + Number(v.hours)) * 60 + Number(v.minutes);
    return new Date(Date.now() + minutes * 60_000).toISOString();
  }
  if (v.resetMode === "exact") return new Date(v.exact).toISOString();
  return null;
}

const modes = [
  { value: "none", label: "No reset" },
  { value: "relative", label: "After…" },
  { value: "exact", label: "Exact date & time" },
] as const;

export function AccountDialog({
  mode,
  emails,
  onClose,
  onSaved,
}: {
  mode: AccountDialogMode | null;
  emails: EmailItem[];
  onClose: () => void;
  onSaved: () => void;
}) {
  return (
    <Dialog open={mode !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        {mode && <AccountForm mode={mode} emails={emails} onClose={onClose} onSaved={onSaved} />}
      </DialogContent>
    </Dialog>
  );
}

function AccountForm({
  mode,
  emails,
  onClose,
  onSaved,
}: {
  mode: AccountDialogMode;
  emails: EmailItem[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const editing = mode.type === "edit" ? mode.account : null;
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      emailId: editing?.emailId ?? (mode.type === "create" ? mode.emailId : undefined) ?? emails[0]?.id ?? "",
      name: editing?.name ?? "",
      quota: editing?.quotaPercent != null ? String(editing.quotaPercent) : "",
      resetMode: editing?.resetAt ? "exact" : "none",
      days: "",
      hours: "",
      minutes: "",
      exact: editing?.resetAt ? toLocalInput(editing.resetAt) : "",
    },
  });
  const resetMode = watch("resetMode");

  const onSubmit = handleSubmit(async (v) => {
    const body = {
      name: v.name,
      quotaPercent: v.quota === "" ? null : Number(v.quota),
      resetAt: computeResetAt(v),
    };
    try {
      if (editing) {
        await api(`/api/accounts/${editing.id}`, { method: "PATCH", body: JSON.stringify(body) });
      } else {
        await api("/api/accounts", { method: "POST", body: JSON.stringify({ ...body, emailId: v.emailId }) });
      }
      toast.success(editing ? "Account updated" : "Account added");
      onSaved();
      onClose();
    } catch (e) {
      toast.error(errMsg(e));
    }
  });

  return (
    <>
      <DialogHeader>
        <DialogTitle>{editing ? "Edit account" : "Add account"}</DialogTitle>
        <DialogDescription>Quota and reset time are optional and can be changed any time.</DialogDescription>
      </DialogHeader>
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <Field label="Email" htmlFor="emailId" error={errors.emailId?.message}>
          <NativeSelect id="emailId" disabled={!!editing} {...register("emailId")}>
            {emails.map((e) => (
              <option key={e.id} value={e.id}>
                {e.address}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field label="Account name" htmlFor="name" error={errors.name?.message}>
          <Input id="name" placeholder="e.g. Work workspace" aria-invalid={!!errors.name} {...register("name")} />
        </Field>
        <Field label="Current quota (%)" htmlFor="quota" error={errors.quota?.message}>
          <Input id="quota" type="number" inputMode="numeric" min={0} max={100} placeholder="0–100" {...register("quota")} />
        </Field>

        <div className="space-y-2">
          <p className="text-sm font-medium leading-none">Next reset</p>
          <div className="grid grid-cols-3 gap-1 rounded-md bg-muted p-1">
            {modes.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setValue("resetMode", m.value)}
                className={cn(
                  "rounded-sm px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors",
                  resetMode === m.value && "bg-background text-foreground shadow-xs",
                )}
              >
                {m.label}
              </button>
            ))}
          </div>

          {resetMode === "relative" && (
            <div className="grid grid-cols-3 gap-2">
              {(["days", "hours", "minutes"] as const).map((k) => (
                <Field key={k} label={k[0].toUpperCase() + k.slice(1)} htmlFor={k}>
                  <Input id={k} type="number" inputMode="numeric" min={0} placeholder="0" {...register(k)} />
                </Field>
              ))}
              {(errors.days || errors.hours || errors.minutes) && (
                <p className="col-span-3 text-xs text-destructive">
                  {errors.days?.message ?? errors.hours?.message ?? errors.minutes?.message}
                </p>
              )}
            </div>
          )}

          {resetMode === "exact" && (
            <Field label="Date and time (your local time)" htmlFor="exact" error={errors.exact?.message}>
              <Input id="exact" type="datetime-local" step={1} {...register("exact")} />
            </Field>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {editing ? "Save changes" : "Add account"}
          </Button>
        </div>
      </form>
    </>
  );
}
