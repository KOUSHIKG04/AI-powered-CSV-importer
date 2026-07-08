"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { Toaster } from "@/components/ui/sonner"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="flex flex-1 flex-col overflow-hidden">
          {children}
        </SidebarInset>
      </SidebarProvider>
      <Toaster />
    </>
  )
}
