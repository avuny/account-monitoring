"use client";
import { useState } from "react";
import { ChevronRight, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AccountDialog, type AccountDialogMode } from "@/components/account-dialog";
import { AddEmailForm } from "@/components/add-email-form";
import { QuotaBar } from "@/components/quota-bar";
import { ResetBadge } from "@/components/reset-badge";
import { api, errMsg } from "@/lib/client-api";
import { formatDateTime } from "@/lib/time";
import type { EmailItem } from "@/lib/types";
import { useNow } from "@/lib/use-now";
import { removeAccount, useMonitorData } from "@/lib/use-monitor-data";
import { cn } from "@/lib/utils";

export function EmailsView() {
  const { emails, accounts, loading, reload } = useMonitorData();
  const now = useNow();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [dialog, setDialog] = useState<AccountDialogMode | null>(null);

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  async function removeEmail(email: EmailItem, count: number) {
    const extra = count ? ` Its ${count} account${count === 1 ? "" : "s"} will be deleted too.` : "";
    if (!window.confirm(`Delete ${email.address}?${extra}`)) return;
    try {
      await api(`/api/emails/${email.id}`, { method: "DELETE" });
      toast.success("Email deleted");
      await reload();
    } catch (e) {
      toast.error(errMsg(e));
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Emails</h1>
        <p className="text-sm text-muted-foreground">Open an email to see the accounts attached to it.</p>
      </div>

      <AddEmailForm onAdded={reload} />

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading emails…</p>
      ) : emails.length === 0 ? (
        <p className="text-sm text-muted-foreground">No emails yet. Add one above.</p>
      ) : (
        <div className="space-y-3">
          {emails.map((email) => {
            const list = accounts.filter((a) => a.emailId === email.id);
            const open = expanded.has(email.id);
            return (
              <Card key={email.id}>
                <div className="flex items-center gap-2 p-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-expanded={open}
                    aria-label={open ? "Hide accounts" : "Show accounts"}
                    onClick={() => toggle(email.id)}
                  >
                    <ChevronRight className={cn("transition-transform", open && "rotate-90")} />
                  </Button>
                  <span className="min-w-0 truncate font-medium">{email.address}</span>
                  <Badge variant="secondary">
                    {list.length} {list.length === 1 ? "account" : "accounts"}
                  </Badge>
                  <div className="ml-auto flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setDialog({ type: "create", emailId: email.id });
                        setExpanded((p) => new Set(p).add(email.id));
                      }}
                    >
                      <Plus /> Add account
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Delete email"
                      onClick={() => removeEmail(email, list.length)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </div>

                {open && (
                  <div className="border-t p-3">
                    {list.length === 0 ? (
                      <p className="px-2 py-3 text-sm text-muted-foreground">No accounts on this email yet.</p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow className="hover:bg-transparent">
                            <TableHead>Account</TableHead>
                            <TableHead>Quota</TableHead>
                            <TableHead>Next reset</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-24" />
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {list.map((a) => (
                            <TableRow key={a.id}>
                              <TableCell className="font-medium">{a.name}</TableCell>
                              <TableCell>
                                <QuotaBar value={a.quotaPercent} />
                              </TableCell>
                              <TableCell className="whitespace-nowrap text-muted-foreground">
                                {a.resetAt ? formatDateTime(a.resetAt) : "—"}
                              </TableCell>
                              <TableCell>
                                <ResetBadge resetAt={a.resetAt} now={now} />
                              </TableCell>
                              <TableCell>
                                <div className="flex justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    aria-label="Edit account"
                                    onClick={() => setDialog({ type: "edit", account: a })}
                                  >
                                    <Pencil />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    aria-label="Delete account"
                                    onClick={() => removeAccount(a.id, reload)}
                                  >
                                    <Trash2 />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <AccountDialog mode={dialog} emails={emails} onClose={() => setDialog(null)} onSaved={reload} />
    </div>
  );
}
