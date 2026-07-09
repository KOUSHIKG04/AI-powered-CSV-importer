"use client"

import { useRef, useMemo } from "react"
import { useVirtualizer } from "@tanstack/react-virtual"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle2, AlertTriangle, Users, FileX, Info } from "lucide-react"

export interface CRMLead {
  created_at?: string
  name?: string
  email?: string
  country_code?: string
  mobile_without_country_code?: string
  company?: string
  city?: string
  state?: string
  country?: string
  lead_owner?: string
  crm_status?:
    "GOOD_LEAD_FOLLOW_UP" | "DID_NOT_CONNECT" | "BAD_LEAD" | "SALE_DONE"
  crm_note?: string
  data_source?: string
  possession_time?: string
  description?: string
  __skipped?: boolean
  __skip_reason?: string
}

interface ResultTableProps {
  records: CRMLead[]
}

export function ResultTable({ records }: ResultTableProps) {
  const { importedLeads, skippedLeads } = useMemo(() => {
    const imported: CRMLead[] = []
    const skipped: CRMLead[] = []

    records.forEach((rec) => {
      if (rec.__skipped) {
        skipped.push(rec)
      } else {
        imported.push(rec)
      }
    })

    return { importedLeads: imported, skippedLeads: skipped }
  }, [records])

  return (
    <div className="w-full min-w-0 space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-3">
        <Card className="border-border bg-card/50 backdrop-blur-sm">
          <CardContent className="flex items-center gap-3 p-4 sm:gap-4 sm:p-5">
            <div className="rounded-xl bg-primary/10 p-2.5 text-primary sm:p-3">
              <Users className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground sm:text-sm">
                Total Imported
              </p>
              <h3 className="text-xl font-bold sm:text-2xl">
                {records.length}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/50 backdrop-blur-sm">
          <CardContent className="flex items-center gap-3 p-4 sm:gap-4 sm:p-5">
            <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-500 sm:p-3">
              <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground sm:text-sm">
                Successfully Parsed
              </p>
              <h3 className="text-xl font-bold text-emerald-500 sm:text-2xl">
                {importedLeads.length}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/50 backdrop-blur-sm">
          <CardContent className="flex items-center gap-3 p-4 sm:gap-4 sm:p-5">
            <div className="rounded-xl bg-rose-500/10 p-2.5 text-rose-500 sm:p-3">
              <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground sm:text-sm">
                Total Skipped
              </p>
              <h3 className="text-xl font-bold text-rose-500 sm:text-2xl">
                {skippedLeads.length}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="imported" className="w-full">
        <div className="mb-4 min-w-0 overflow-x-auto border-b pb-2">
          <TabsList className="min-w-max border-0 bg-muted/50 p-1 group-data-horizontal/tabs:h-auto">
            <TabsTrigger
              value="imported"
              className="cursor-pointer px-3 py-1.5 text-[11px] sm:px-4 sm:text-xs data-active:border-transparent dark:data-active:border-transparent"
            >
              Imported Leads
              <Badge
                className="border-none px-3 py-3.5 text-[10px]"
                variant="secondary"
              >
                {importedLeads.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="skipped"
              className="cursor-pointer px-3 py-1.5 text-[11px] sm:px-4 sm:text-xs data-active:border-transparent dark:data-active:border-transparent"
            >
              Skipped Records
              <Badge
                className="border-none px-3 py-3.5 text-[10px]"
                variant="secondary"
              >
                {skippedLeads.length}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="imported" className="mt-0">
          {importedLeads.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border bg-card/20 p-8 text-center sm:p-12">
              <FileX className="mb-4 h-10 w-10 text-muted-foreground sm:h-12 sm:w-12" />
              <p className="text-sm text-muted-foreground">
                No leads successfully imported.
              </p>
            </div>
          ) : (
            <div className="w-full min-w-0 overflow-hidden rounded-xl border bg-card">
              <div className="w-full overflow-x-auto pb-2">
                <div className="min-w-[1440px]">
                  <div className="grid grid-cols-[180px_260px_170px_150px_180px_180px_260px] gap-3 border-b bg-secondary px-4 py-3 text-[11px] font-bold tracking-wider text-secondary-foreground uppercase sm:gap-4 sm:px-6 sm:text-xs">
                    <div>Lead Name</div>
                    <div>Email</div>
                    <div>Contact</div>
                    <div>Date Created</div>
                    <div>Company</div>
                    <div>Status</div>
                    <div>Lead Owner</div>
                  </div>

                  <VirtualizedList leads={importedLeads} type="imported" />
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="skipped" className="mt-0">
          {skippedLeads.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border bg-card/20 p-8 text-center sm:p-12">
              <CheckCircle2 className="mb-4 h-10 w-10 text-emerald-500 sm:h-12 sm:w-12" />
              <p className="text-sm text-muted-foreground">
                Zero records skipped. Clean import!
              </p>
            </div>
          ) : (
            <div className="w-full min-w-0 overflow-hidden rounded-xl border bg-card">
              <div className="w-full overflow-x-auto pb-2">
                <div className="min-w-[1120px]">
                  <div className="grid grid-cols-[260px_180px_260px_170px_250px] gap-3 border-b bg-secondary px-4 py-3 text-[11px] font-bold tracking-wider text-secondary-foreground uppercase sm:gap-4 sm:px-6 sm:text-xs">
                    <div>Skip Reason</div>
                    <div>Name</div>
                    <div>Email</div>
                    <div>Contact</div>
                    <div>CRM Note Extract</div>
                  </div>

                  <VirtualizedList leads={skippedLeads} type="skipped" />
                </div>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function VirtualizedList({
  leads,
  type,
}: {
  leads: CRMLead[]
  type: "imported" | "skipped"
}) {
  const parentRef = useRef<HTMLDivElement>(null)

  // TanStack Virtual intentionally returns function-bearing objects.
  // eslint-disable-next-line react-hooks/incompatible-library
  const rowVirtualizer = useVirtualizer({
    count: leads.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 52,
    overscan: 10,
  })

  return (
    <div
      ref={parentRef}
      className="max-h-[420px] overflow-x-hidden overflow-y-auto sm:max-h-[500px]"
      style={{
        position: "relative",
      }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const lead = leads[virtualRow.index]
          if (!lead) return null

          const contact =
            lead.email && lead.mobile_without_country_code
              ? `${lead.country_code || ""}${lead.mobile_without_country_code}`
              : lead.mobile_without_country_code
                ? `${lead.country_code || ""}${lead.mobile_without_country_code}`
                : "-"

          return (
            <div
              key={virtualRow.key}
              className="absolute top-0 left-0 flex w-full items-center border-b border-border px-4 transition-colors hover:bg-muted/30 sm:px-6"
              style={{
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {type === "imported" ? (
                <div className="grid w-full grid-cols-[180px_260px_170px_150px_180px_180px_260px] items-center gap-3 text-xs sm:gap-4 sm:text-sm">
                  <div
                    className="truncate font-medium text-foreground"
                    title={lead.name}
                  >
                    {lead.name || "-"}
                  </div>
                  <div
                    className="truncate text-muted-foreground"
                    title={lead.email}
                  >
                    {lead.email || "-"}
                  </div>
                  <div className="truncate text-muted-foreground">
                    {contact}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {lead.created_at
                      ? new Date(lead.created_at).toLocaleDateString(
                          undefined,
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )
                      : "-"}
                  </div>
                  <div
                    className="truncate text-muted-foreground"
                    title={lead.company}
                  >
                    {lead.company || "-"}
                  </div>
                  <div>{getStatusBadge(lead.crm_status)}</div>
                  <div
                    className="truncate text-muted-foreground"
                    title={lead.lead_owner}
                  >
                    {lead.lead_owner || "-"}
                  </div>
                </div>
              ) : (
                <div className="grid w-full grid-cols-[260px_180px_260px_170px_250px] items-center gap-3 text-xs sm:gap-4 sm:text-sm">
                  <div
                    className="flex items-center gap-1.5 truncate font-semibold text-rose-500"
                    title={lead.__skip_reason}
                  >
                    <Info className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">
                      {lead.__skip_reason || "Invalid Record"}
                    </span>
                  </div>
                  <div
                    className="truncate text-muted-foreground"
                    title={lead.name}
                  >
                    {lead.name || "-"}
                  </div>
                  <div
                    className="truncate text-muted-foreground"
                    title={lead.email}
                  >
                    {lead.email || "-"}
                  </div>
                  <div className="truncate text-muted-foreground">
                    {contact}
                  </div>
                  <div
                    className="truncate text-xs text-muted-foreground"
                    title={lead.crm_note}
                  >
                    {lead.crm_note || "-"}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

const getStatusBadge = (status?: string) => {
  switch (status) {
    case "SALE_DONE":
      return (
        <Badge className="border-blue-500/20 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20">
          Sale Done
        </Badge>
      )
    case "GOOD_LEAD_FOLLOW_UP":
      return (
        <Badge className="border-emerald-500/20 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20">
          Good Lead
        </Badge>
      )
    case "DID_NOT_CONNECT":
      return (
        <Badge className="border-amber-500/20 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20">
          Did Not Connect
        </Badge>
      )
    case "BAD_LEAD":
      return (
        <Badge className="border-rose-500/20 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20">
          Bad Lead
        </Badge>
      )
    default:
      return <Badge variant="secondary">Unknown</Badge>
  }
}
