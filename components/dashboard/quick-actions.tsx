"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  PhoneCall,
  UserPlus,
  FileSpreadsheet,
  Settings,
  BarChart2,
  Calendar,
} from "lucide-react"
import { useRouter } from "next/navigation"

const actions = [
  {
    icon: PhoneCall,
    label: "Start Calling",
    description: "Begin a new calling session",
    href: "/calls/new",
    variant: "default" as const,
  },
  {
    icon: UserPlus,
    label: "Add Client",
    description: "Create a new client profile",
    href: "/clients/new",
    variant: "outline" as const,
  },
  {
    icon: FileSpreadsheet,
    label: "Import Leads",
    description: "Bulk import new leads",
    href: "/leads/import",
    variant: "outline" as const,
  },
  {
    icon: Calendar,
    label: "Schedule",
    description: "View calling schedule",
    href: "/schedule",
    variant: "outline" as const,
  },
  {
    icon: BarChart2,
    label: "Reports",
    description: "View analytics & reports",
    href: "/reports",
    variant: "outline" as const,
  },
  {
    icon: Settings,
    label: "Settings",
    description: "Configure system settings",
    href: "/settings",
    variant: "outline" as const,
  },
]

export function QuickActions() {
  const router = useRouter()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
        <CardDescription>Common tasks and shortcuts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {actions.map((action) => (
            <Button
              key={action.label}
              variant={action.variant}
              className="h-auto flex-col items-start gap-2 p-4 text-left"
              onClick={() => router.push(action.href)}
            >
              <div className="flex items-center gap-2">
                <action.icon className="h-4 w-4" />
                <span className="font-semibold">{action.label}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {action.description}
              </span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}