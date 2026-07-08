import Link from "next/link"
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  Clock,
  FileUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { SidebarTrigger } from "@/components/ui/sidebar"

const stats = [
  {
    label: "CSV formats supported",
    value: "Any valid CSV",
    icon: FileUp,
  },
  {
    label: "AI batch workflow",
    value: "30 rows",
    icon: Clock,
  },
  {
    label: "CRM output fields",
    value: "15 fields",
    icon: BarChart3,
  },
  {
    label: "Invalid lead handling",
    value: "Skipped",
    icon: CheckCircle2,
  },
]

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <header className="flex h-16 shrink-0 items-center justify-between border-b bg-card pr-8 pl-3">
        <div className="flex min-w-0 items-center gap-3">
          <SidebarTrigger className="shrink-0 cursor-pointer" />
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold">Dashboard</h1>
            <p className="truncate text-xs text-muted-foreground">
              Import health, mapping coverage, and CRM processing overview.
            </p>
          </div>
        </div>

        <Button
          size="sm"
          nativeButton={false}
          variant="default"
          className="gap-2"
          render={
            <Link href="/manage-lead">
              <ArrowLeft className="size-4" />
              Manage Leads
            </Link>
          }
        />
      </header>

      <main className="flex-1 overflow-y-auto p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold tracking-tight">
            AI CSV Importer
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Monitor the importer workflow, mapping coverage, and skipped-record
            handling from one place.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="bg-card/70">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex size-10 items-center justify-center border bg-muted text-primary">
                  <stat.icon className="size-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className="mt-1 text-lg font-semibold">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
