"use client";
import Link from "next/link";
import { useCallback, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AccountDialog, type AccountDialogMode } from "@/components/account-dialog";
import { AccountsTable } from "@/components/accounts-table";
import type { AccountItem } from "@/lib/types";
import { removeAccount, useMonitorData } from "@/lib/use-monitor-data";

export function AccountsView() {
  const { emails, accounts, loading, reload } = useMonitorData();
  const [dialog, setDialog] = useState<AccountDialogMode | null>(null);

  const onEdit = useCallback((account: AccountItem) => setDialog({ type: "edit", account }), []);
  const onDelete = useCallback((a: AccountItem) => removeAccount(a.id, reload), [reload]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Accounts</h1>
          <p className="text-sm text-muted-foreground">Quota and next reset for every account you track.</p>
        </div>
        <Button disabled={emails.length === 0} onClick={() => setDialog({ type: "create" })}>
          <Plus /> Add account
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading accounts…</p>
      ) : emails.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-start gap-3 p-6">
            <p className="text-sm text-muted-foreground">Add an email first, then attach accounts to it.</p>
            <Button asChild>
              <Link href="/emails">Add your first email</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <AccountsTable accounts={accounts} onEdit={onEdit} onDelete={onDelete} />
      )}

      <AccountDialog mode={dialog} emails={emails} onClose={() => setDialog(null)} onSaved={reload} />
    </div>
  );
}
