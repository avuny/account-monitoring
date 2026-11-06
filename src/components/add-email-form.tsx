"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api, errMsg } from "@/lib/client-api";

const schema = z.object({ address: z.string().trim().email("Enter a valid email address") });
type Values = z.infer<typeof schema>;

export function AddEmailForm({ onAdded }: { onAdded: () => void }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { address: "" } });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await api("/api/emails", { method: "POST", body: JSON.stringify(values) });
      toast.success("Email added");
      reset();
      onAdded();
    } catch (e) {
      toast.error(errMsg(e));
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-1.5">
      <div className="flex gap-2">
        <Input
          type="email"
          placeholder="name@example.com"
          aria-label="Email address"
          aria-invalid={!!errors.address}
          {...register("address")}
        />
        <Button type="submit" disabled={isSubmitting}>
          <Plus /> Add email
        </Button>
      </div>
      {errors.address && <p className="text-xs text-destructive">{errors.address.message}</p>}
    </form>
  );
}
