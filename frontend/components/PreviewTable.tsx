"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface PreviewTableProps {
  headers: string[]
  rows: Record<string, string>[]
}

export function PreviewTable({ headers, rows }: PreviewTableProps) {
  if (rows.length === 0) return null

  return (
    <div className="max-w-full overflow-hidden rounded-lg border bg-card">
      <div className="max-h-[260px] max-w-full overflow-auto">
        <Table className="relative min-w-max border-collapse">
          <TableHeader className="sticky top-0 z-10 bg-secondary shadow-[0_1px_0_0_rgba(0,0,0,0.1)]">
            <TableRow className="hover:bg-transparent">
              {headers.map((header) => (
                <TableHead
                  key={header}
                  className="px-4 py-3 text-xs font-bold whitespace-nowrap text-secondary-foreground uppercase"
                >
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, rowIndex) => (
              <TableRow
                key={rowIndex}
                className="border-b border-border last:border-0 hover:bg-muted/30"
              >
                {headers.map((header) => (
                  <TableCell
                    key={`${rowIndex}-${header}`}
                    className="max-w-[220px] truncate px-4 py-2.5 text-xs text-muted-foreground"
                    title={row[header] || "-"}
                  >
                    {row[header] || "-"}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

