"use client"

import React, { useRef, useState } from "react"
import { Upload, FileSpreadsheet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface FileUploaderProps {
  onFileSelect: (file: File) => void
  allowedExtensions?: string[]
}

export function FileUploader({
  onFileSelect,
  allowedExtensions = [".csv"],
}: FileUploaderProps) {
  const [isDragActive, setIsDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true)
    } else if (e.type === "dragleave") {
      setIsDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      validateAndSelectFile(file)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSelectFile(e.target.files[0])
    }
  }

  const validateAndSelectFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("CSV file must be 5MB or smaller.")
      return
    }

    const extension = file.name
      .substring(file.name.lastIndexOf("."))
      .toLowerCase()
    if (allowedExtensions.includes(extension)) {
      onFileSelect(file)
    } else {
      toast.error("Invalid file type. Please upload a .csv file.")
    }
  }

  const downloadSampleTemplate = () => {
    const csvContent =
      "created_at,name,email,country_code,mobile_without_country_code,company,city,state,country,lead_owner,crm_status,crm_note,data_source,possession_time,description\n" +
      "2026-05-13 14:20:48,John Doe,john.doe@example.com,+91,9876543210,GrowEasy,Mumbai,Maharashtra,India,test@gmail.com,GOOD_LEAD_FOLLOW_UP,Needs rescheduling demo,leads_on_demand,,\n" +
      "2026-05-13 14:25:30,Sarah Johnson,sarah.johnson@example.com,+91,9876543211,Tech Solutions,Bangalore,Karnataka,India,test@gmail.com,DID_NOT_CONNECT,Call back next week,,,\n"

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "GrowEasy_Lead_Template.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div
      className={`relative flex flex-col items-center justify-center transition-colors ${
        isDragActive
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/20 hover:border-primary/50"
      }`}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
    >
      <div
        onClick={() => fileInputRef.current?.click()}
        className="mb-5 flex w-[80%] cursor-pointer flex-col items-center justify-center border border-border bg-muted px-2 py-6"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={allowedExtensions.join(",")}
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Upload className="h-6 w-6" />
        </div>

        <div className="mb-1 flex items-center gap-1 text-center text-base font-semibold">
          Drop your CSV file here
          <p className="text-center text-sm text-muted-foreground">or</p>{" "}
          <span
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer font-medium text-primary hover:underline"
          >
            click to browse files
          </span>
        </div>

        <div className="mt-3 mb-4 inline-flex items-center gap-1.5 bg-black/50 px-3 py-2 text-xs text-muted-foreground">
          <span>Supported file: .csv (max 5MB)</span>
        </div>
      </div>

      <div className="mb-6 max-w-3xl text-center text-[13px] leading-relaxed text-muted-foreground">
        <span className="text-white underline">Required headers:</span>{" "}
        created_at, name, email, country_code, mobile_without_country_code,
        company, city, state, country, lead_owner, crm_status, crm_note.
        Template includes default + custom CRM fields to reduce upload errors.
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={downloadSampleTemplate}
        className="bg-muted cursor-pointer text-primary"
      >
        <FileSpreadsheet className="h-4 w-4" />
        Download Sample CSV Template
      </Button>
    </div>
  )
}
