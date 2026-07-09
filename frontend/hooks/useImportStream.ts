"use client"

import { useRef, useState } from "react"
import { toast } from "sonner"
import { API_BASE_URL } from "@/lib/config"
import type { CRMLead } from "@/components/ResultTable"

type ImportStreamEvent =
  | {
      type: "batch_result"
      records: CRMLead[]
      processed: number
      total: number
    }
  | {
      type: "done"
      message: string
    }
  | {
      type: "error"
      error: string
    }

export function useImportStream() {
  const [isImporting, setIsImporting] = useState(false)
  const [processedCount, setProcessedCount] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [processedLeads, setProcessedLeads] = useState<CRMLead[]>([])
  const abortControllerRef = useRef<AbortController | null>(null)

  const clearResults = () => {
    setProcessedLeads([])
    setProcessedCount(0)
    setTotalCount(0)
  }

  const abortImport = () => {
    abortControllerRef.current?.abort()
    abortControllerRef.current = null
  }

  const importRows = async (
    rawCsvRows: Record<string, string>[],
    onComplete?: () => void
  ) => {
    if (rawCsvRows.length === 0) return

    setIsImporting(true)
    setProcessedCount(0)
    setTotalCount(rawCsvRows.length)
    setProcessedLeads([])
    abortControllerRef.current = new AbortController()

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/import-stream`, {
        method: "POST",
        signal: abortControllerRef.current.signal,
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
          if (!line.startsWith("data: ")) continue

          const dataStr = line.slice(6).trim()
          if (!dataStr) continue

          let data: ImportStreamEvent

          try {
            data = JSON.parse(dataStr) as ImportStreamEvent
          } catch {
            toast.error("Invalid stream response from server.")
            continue
          }

          if (data.type === "batch_result") {
            setProcessedLeads((prev) => [...prev, ...data.records])
            setProcessedCount(data.processed)
          } else if (data.type === "error") {
            throw new Error(data.error || "Import stream failed.")
          }
        }
      }

      onComplete?.()
      toast.success("CSV import completed.")
    } catch (error: unknown) {
      if (error instanceof DOMException && error.name === "AbortError") {
        toast.info("CSV import cancelled.")
        return
      }

      console.error("SSE stream error:", error)
      const message =
        error instanceof Error ? error.message : "Unknown import error"
      toast.error(`Import failed: ${message}`)
    } finally {
      abortControllerRef.current = null
      setIsImporting(false)
    }
  }

  return {
    isImporting,
    processedCount,
    totalCount,
    processedLeads,
    clearResults,
    abortImport,
    importRows,
  }
}
