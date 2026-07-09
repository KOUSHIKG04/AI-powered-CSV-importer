"use client"

import { useState } from "react"
import Papa from "papaparse"
import { toast } from "sonner"

export function useCsvPreview() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isParsingCsv, setIsParsingCsv] = useState(false)
  const [csvHeaders, setCsvHeaders] = useState<string[]>([])
  const [rawCsvRows, setRawCsvRows] = useState<Record<string, string>[]>([])

  const resetPreview = () => {
    setSelectedFile(null)
    setCsvHeaders([])
    setRawCsvRows([])
  }

  const parseFile = (file: File) => {
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
          resetPreview()
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
        resetPreview()
      },
    })
  }

  return {
    selectedFile,
    isParsingCsv,
    csvHeaders,
    rawCsvRows,
    parseFile,
    resetPreview,
  }
}
