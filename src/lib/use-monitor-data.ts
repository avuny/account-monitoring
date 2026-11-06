"use client";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { api, errMsg } from "./client-api";
import type { AccountItem, EmailItem } from "./types";

export function useMonitorData() {
  const [emails, setEmails] = useState<EmailItem[] | null>(null);
  const [accounts, setAccounts] = useState<AccountItem[] | null>(null);

  const reload = useCallback(async () => {
    try {
      const [e, a] = await Promise.all([api<EmailItem[]>("/api/emails"), api<AccountItem[]>("/api/accounts")]);
      setEmails(e);
      setAccounts(a);
    } catch (err) {
      toast.error(errMsg(err));
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { emails: emails ?? [], accounts: accounts ?? [], loading: emails === null || accounts === null, reload };
}

export async function removeAccount(id: string, reload: () => Promise<void>) {
  if (!window.confirm("Delete this account?")) return;
  try {
    await api(`/api/accounts/${id}`, { method: "DELETE" });
    toast.success("Account deleted");
    await reload();
  } catch (e) {
    toast.error(errMsg(e));
  }
}
