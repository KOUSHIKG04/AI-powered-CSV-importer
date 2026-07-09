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
    <div className="w-full min-w-0 overflow-hidden rounded-lg border bg-card">
      <div className="max-h-[220px] w-full overflow-auto sm:max-h-[260px]">
        <Table className="relative min-w-[640px] border-collapse sm:min-w-max">
          <TableHeader className="sticky top-0 z-10 bg-secondary shadow-[0_1px_0_0_rgba(0,0,0,0.1)]">
            <TableRow className="hover:bg-transparent">
              {headers.map((header) => (
                <TableHead
                  key={header}
                  className="px-3 py-2.5 text-[11px] font-bold whitespace-nowrap text-secondary-foreground uppercase sm:px-4 sm:py-3 sm:text-xs"
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
                    className="max-w-[160px] truncate px-3 py-2 text-[11px] text-muted-foreground sm:max-w-[220px] sm:px-4 sm:py-2.5 sm:text-xs"
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

