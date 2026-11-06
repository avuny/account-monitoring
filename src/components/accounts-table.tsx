"use client";
import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type Column,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { QuotaBar } from "@/components/quota-bar";
import { ResetBadge } from "@/components/reset-badge";
import { formatDateTime } from "@/lib/time";
import type { AccountItem } from "@/lib/types";
import { useNow } from "@/lib/use-now";

const presets: Record<string, { label: string; sort: SortingState }> = {
  "reset-asc": { label: "Nearest reset first", sort: [{ id: "resetAt", desc: false }] },
  "reset-desc": { label: "Farthest reset first", sort: [{ id: "resetAt", desc: true }] },
  "quota-asc": { label: "Quota: low to high", sort: [{ id: "quota", desc: false }] },
  "quota-desc": { label: "Quota: high to low", sort: [{ id: "quota", desc: true }] },
};

function SortButton({ column, label }: { column: Column<AccountItem, unknown>; label: string }) {
  const sorted = column.getIsSorted();
  return (
    <Button variant="ghost" size="sm" className="-ml-3" onClick={() => column.toggleSorting(sorted === "asc")}>
      {label}
      {sorted === "asc" ? <ArrowUp /> : sorted === "desc" ? <ArrowDown /> : <ArrowUpDown className="opacity-50" />}
    </Button>
  );
}

export function AccountsTable({
  accounts,
  onEdit,
  onDelete,
}: {
  accounts: AccountItem[];
  onEdit: (a: AccountItem) => void;
  onDelete: (a: AccountItem) => void;
}) {
  const now = useNow();
  const [sorting, setSorting] = useState<SortingState>(presets["reset-asc"].sort);

  const columns = useMemo<ColumnDef<AccountItem>[]>(
    () => [
      { accessorKey: "emailAddress", header: ({ column }) => <SortButton column={column} label="Email" /> },
      {
        accessorKey: "name",
        header: ({ column }) => <SortButton column={column} label="Account" />,
        cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
      },
      {
        id: "quota",
        accessorFn: (r) => r.quotaPercent ?? undefined,
        sortUndefined: "last",
        header: ({ column }) => <SortButton column={column} label="Quota" />,
        cell: ({ row }) => <QuotaBar value={row.original.quotaPercent} />,
      },
      {
        id: "resetAt",
        accessorFn: (r) => (r.resetAt ? new Date(r.resetAt).getTime() : undefined),
        sortUndefined: "last",
        header: ({ column }) => <SortButton column={column} label="Next reset" />,
        cell: ({ row }) =>
          row.original.resetAt ? (
            <span className="whitespace-nowrap text-muted-foreground">{formatDateTime(row.original.resetAt)}</span>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
      {
        id: "status",
        header: "Status",
        enableSorting: false,
        cell: ({ row }) => <ResetBadge resetAt={row.original.resetAt} now={now} />,
      },
      {
        id: "actions",
        enableSorting: false,
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <Button variant="ghost" size="icon" aria-label="Edit account" onClick={() => onEdit(row.original)}>
              <Pencil />
            </Button>
            <Button variant="ghost" size="icon" aria-label="Delete account" onClick={() => onDelete(row.original)}>
              <Trash2 />
            </Button>
          </div>
        ),
      },
    ],
    [now, onEdit, onDelete],
  );

  const table = useReactTable({
    data: accounts,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const current = Object.entries(presets).find(
    ([, p]) => p.sort[0].id === sorting[0]?.id && p.sort[0].desc === sorting[0]?.desc,
  )?.[0];

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <NativeSelect
          aria-label="Sort accounts"
          className="w-52"
          value={current ?? ""}
          onChange={(e) => setSorting(presets[e.target.value].sort)}
        >
          {!current && (
            <option value="" disabled>
              Custom sort
            </option>
          )}
          {Object.entries(presets).map(([key, p]) => (
            <option key={key} value={key}>
              {p.label}
            </option>
          ))}
        </NativeSelect>
      </div>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="hover:bg-transparent">
                {hg.headers.map((h) => (
                  <TableHead key={h.id}>{flexRender(h.column.columnDef.header, h.getContext())}</TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  No accounts yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
