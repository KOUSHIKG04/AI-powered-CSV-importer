"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChartColumn, Database } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toggletheme } from "@/components/Toggletheme"

const mainMenuItems = [
  { title: "Manage Leads", icon: Database, url: "/manage-leads" },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  return (
    <TooltipProvider delay={150}>
      <Sidebar
        collapsible="icon"
        className="border-r border-border/60 bg-sidebar/80 backdrop-blur-md"
        {...props}
      >
        <SidebarHeader className="px-2 py-3.5">
          <Link
            href="/manage-lead"
            title="CRM Importer home"
            aria-label="CRM Importer home"
            className="flex h-9 items-center gap-2 overflow-hidden px-2"
          >
            <div className="flex size-4 shrink-0 items-center justify-center text-primary">
              <ChartColumn className="size-4" />
            </div>
            <p className="truncate text-[14px] font-medium tracking-tighter text-muted-foreground group-data-[collapsible=icon]:hidden">
              CRM Importer - AI
            </p>
          </Link>
        </SidebarHeader>

        <SidebarContent className="gap-0">
          <SidebarGroup>
            <SidebarGroupContent className="mt-1">
              <SidebarMenu>
                {mainMenuItems.map((item) => {
                  const isActive = item.url === pathname
                  return (
                    <SidebarMenuItem key={item.title} className="mb-2">
                      <SidebarMenuButton
                        isActive={isActive}
                        tooltip={item.title}
                        render={
                          <Link href={item.url}>
                            <item.icon className="mr-1" />
                            <span className="text-[15px]">{item.title}</span>
                          </Link>
                        }
                      >
                        {item.title}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="gap-3.5 border-t border-border/40 p-2">
          <div className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/20 p-1.5 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:border-transparent group-data-[collapsible=icon]:bg-transparent">
            <span className="px-2 text-xs font-semibold text-muted-foreground/80 group-data-[collapsible=icon]:hidden">
              Appearance
            </span>
            <Toggletheme />
          </div>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    </TooltipProvider>
  )
}
