"use client"

import { useState } from "react"
import Papa from "papaparse"
import {
  Upload,
  Plus,
  RefreshCw,
  Search,
  Database,
  Loader2,
  Trash2,
  FileCheck,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { FileUploader } from "@/components/FileUploader"
import { PreviewTable } from "@/components/PreviewTable"
import { ResultTable, type CRMLead } from "@/components/ResultTable"

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000"

export default function ManagePage() {
  // Modal states
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isParsingCsv, setIsParsingCsv] = useState(false)


  const [csvHeaders, setCsvHeaders] = useState<string[]>([])
  const [rawCsvRows, setRawCsvRows] = useState<Record<string, string>[]>([])

  
  const [isImporting, setIsImporting] = useState(false)
  const [processedCount, setProcessedCount] = useState(0)
  const [totalCount, setTotalCount] = useState(0)


  const [processedLeads, setProcessedLeads] = useState<CRMLead[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  
  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    setIsParsingCsv(true)

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        const rows = results.data.filter((row) =>
          Object.values(row).some((value) => String(value ?? "").trim() !== "")
        )

        if (rows.length === 0) {
          toast.error("CSV file does not contain any data rows.")
          setIsParsingCsv(false)
          resetUploadState()
          return
        }

        setCsvHeaders(results.meta.fields ?? Object.keys(rows[0] ?? {}))
        setRawCsvRows(rows)
        setIsParsingCsv(false)
        toast.success("CSV parsed and ready for preview.")
      },
      error: (error) => {
        toast.error(`Failed to parse CSV file: ${error.message}`)
        setIsParsingCsv(false)
        resetUploadState()
      },
    })
  }

 
  const resetUploadState = () => {
    setSelectedFile(null)
    setCsvHeaders([])
    setRawCsvRows([])
    setProcessedCount(0)
    setTotalCount(0)
  }

  // Triggers SSE Streaming batch processing to backend
  const handleConfirmImport = async () => {
    if (rawCsvRows.length === 0) return

    setIsImporting(true)
    setProcessedCount(0)
    setTotalCount(rawCsvRows.length)
    setProcessedLeads([])

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/import-stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ records: rawCsvRows }),
      })

      if (!response.body) {
        throw new Error("Failed to initialize import stream.")
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""

      while (true) {
        const { value, done } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n\n")
        buffer = lines.pop() || ""

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.slice(6).trim()
            if (!dataStr) continue

            const data = JSON.parse(dataStr)

            if (data.type === "batch_result") {
              setProcessedLeads((prev) => [...prev, ...data.records])
              setProcessedCount(data.processed)
            } else if (data.type === "error") {
              throw new Error(data.error || "Import stream failed.")
            }
          }
        }
      }

      setIsUploadOpen(false)
      resetUploadState()
      toast.success("CSV import completed.")
    } catch (error: unknown) {
      console.error("SSE stream error:", error)
      const message =
        error instanceof Error ? error.message : "Unknown import error"
      toast.error(`Import failed: ${message}`)
    } finally {
      setIsImporting(false)
    }
  }

  const filteredLeads = processedLeads.filter((lead) => {
    const term = searchQuery.toLowerCase()
    if (!term) return true

    const contactStr = `${lead.country_code || ""}${lead.mobile_without_country_code || ""}`
    return (
      (lead.name?.toLowerCase().includes(term) ?? false) ||
      (lead.email?.toLowerCase().includes(term) ?? false) ||
      contactStr.includes(term)
    )
  })

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <header className="flex h-16 items-center justify-between border-b bg-card pr-8 pl-3">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="cursor-pointer" />
          <div className="flex flex-col">
            <p className="text-xs text-muted-foreground">
              Monitor lead status, assign tasks, and close deals faster.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {processedLeads.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="border-rose-500/20 text-rose-500 hover:bg-rose-500/10"
              onClick={() => setProcessedLeads([])}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear Data
            </Button>
          )}
          <Button
            size="sm"
            onClick={() => setIsUploadOpen(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Import Leads
          </Button>
        </div>
      </header>

      <main className="flex-1 space-y-6 overflow-y-auto p-8">
        {processedLeads.length === 0 ? (
          <div className="mx-auto mt-12 flex max-w-2xl flex-col items-center justify-center rounded-2xl pt-18 text-center">
            <Database className="mb-6 h-16 w-16 text-muted-foreground/45" />
            <h2 className="mb-2 text-lg font-bold text-foreground">
              No Leads Imported Yet
            </h2>
            <p className="mb-6 max-w-sm text-sm tracking-wider text-muted-foreground">
              Get started by uploading a spreadsheet. Our AI agent will
              dynamically identify, map, and normalize any CSV format into the
              CRM schema.
            </p>
            <Button onClick={() => setIsUploadOpen(true)} className="gap-2">
              <Upload className="h-4 w-4" />
              Import Leads via CSV
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex max-w-md items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Enter email or phone number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-border bg-card pl-9"
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 border-border bg-card"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>

            <ResultTable records={filteredLeads} />
          </div>
        )}
      </main>

      <Dialog
        open={isUploadOpen}
        onOpenChange={(open) => !isImporting && setIsUploadOpen(open)}
      >
        <DialogContent className="h-[550px] w-[92vw]! max-w-[900px]! overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-bold">
              Import Leads via CSV
            </DialogTitle>
            <p className="text-center text-sm text-muted-foreground">
              Upload a CSV file to bulk import leads into your system.
            </p>
          </DialogHeader>

          <div className="min-w-0 space-y-6 overflow-hidden">
            {!selectedFile && !isParsingCsv && (
              <FileUploader onFileSelect={handleFileSelect} />
            )}

            {isParsingCsv && (
              <div className="flex flex-col items-center justify-center gap-3 py-16">
                <Loader2 className="size-8 animate-spin text-primary" />
                <p className="text-sm font-medium">Parsing CSV preview...</p>
                <p className="text-xs text-muted-foreground">
                  No AI processing runs until you confirm import.
                </p>
              </div>
            )}

            {selectedFile && !isParsingCsv && !isImporting && (
              <div className="min-w-0 space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-orange-500/10 bg-orange-500/5 p-3.5">
                  <div className="flex items-center gap-3">
                    <FileCheck className="h-5 w-5 text-orange-500" />
                    <div className="flex flex-col">
                      <span className="truncate sm:text-[10px] lg:text-sm text-foreground tracking-tighter">
                        {selectedFile.name}
                      </span>
                      <span className="text-[10px] font-medium text-muted-foreground/80">
                        {(selectedFile.size / 1024).toFixed(2)} KB
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={resetUploadState}
                    className="text-xs font-semibold text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  >
                    Change File
                  </Button>
                </div>

                <div className="min-w-0 space-y-1.5">
                  <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                    CSV Preview Rows (Pre-AI Mapping)
                  </span>
                  <PreviewTable
                    headers={csvHeaders}
                    rows={rawCsvRows.slice(0, 10)}
                  />
                </div>

                <div className="flex items-center justify-end gap-3 border-t pt-4">
                  <Button variant="outline" onClick={resetUploadState}>
                    Cancel
                  </Button>
                  <Button onClick={handleConfirmImport}>Confirm Import</Button>
                </div>
              </div>
            )}

            {isImporting && (
              <div className="flex flex-col items-center justify-center space-y-6 py-12">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <div className="w-full max-w-md space-y-3 text-center">
                  <div className="flex items-center justify-center text-sm">
                    <span className="font-semibold text-foreground">
                      AI Lead Mapping...
                    </span>
                  </div>
                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div className="absolute inset-y-0 left-0 w-1/3 animate-import-progress rounded-full bg-primary" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {processedCount === 0
                      ? `Processing first batch of ${totalCount} records.`
                      : `Processed ${processedCount} of ${totalCount} records.`}
                    Normalizing data using Gemini...
                  </p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
