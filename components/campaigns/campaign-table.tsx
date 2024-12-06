"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  MoreVertical,
  Play,
  Pause,
  Pencil,
  Clock,
  Calendar,
  Globe,
  PhoneCall,
  Settings,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Campaign } from "@/types"
import Link from "next/link"
import { format } from "date-fns"

interface CampaignTableProps {
  campaigns: Campaign[]
  clientId: string
  onStatusToggle: (campaignId: string) => void
  onEdit: (campaignId: string) => void
}

export function CampaignTable({
  campaigns,
  clientId,
  onStatusToggle,
  onEdit,
}: CampaignTableProps) {
  return (
    <div className="enhanced-table">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date Range</TableHead>
            <TableHead>Call Window</TableHead>
            <TableHead>Daily Limit</TableHead>
            <TableHead>Calls Made</TableHead>
            <TableHead>Success Rate</TableHead>
            <TableHead>Settings</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((campaign) => (
            <TableRow key={campaign.id}>
              <TableCell className="font-medium">
                <Link 
                  href={`/clients/${clientId}/campaigns/${campaign.id}`}
                  className="hover:text-primary transition-colors"
                >
                  {campaign.name}
                </Link>
              </TableCell>
              <TableCell>
                <Badge
                  variant={campaign.status === "active" ? "default" : "secondary"}
                  className="enhanced-badge"
                >
                  {campaign.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {format(new Date(campaign.startDate), 'MMM d')} - {format(new Date(campaign.endDate), 'MMM d, yyyy')}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {campaign.callWindowStart} - {campaign.callWindowEnd}
                  </span>
                  <Badge variant="outline" className="ml-2">
                    <Globe className="h-3 w-3 mr-1" />
                    {campaign.timeZone}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <PhoneCall className="h-4 w-4 text-muted-foreground" />
                  <span>{campaign.dailyCallLimit}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="enhanced-badge">
                  {campaign.calls}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 rounded-full bg-black/20 overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-500"
                      style={{ width: `${campaign.successRate}%` }}
                    />
                  </div>
                  <span>{campaign.successRate}%</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={campaign.voicemailDetection ? "default" : "secondary"}
                    className="enhanced-badge"
                  >
                    VM {campaign.voicemailDetection ? "On" : "Off"}
                  </Badge>
                  <Badge variant="outline" className="enhanced-badge">
                    {campaign.maxAttempts} tries
                  </Badge>
                  <Badge variant="outline" className="enhanced-badge">
                    {campaign.callInterval}h gap
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onStatusToggle(campaign.id)}
                    className={campaign.status === "active" ? "text-primary hover:text-primary/80" : ""}
                  >
                    {campaign.status === "active" ? (
                      <Pause className="h-4 w-4 animate-pulse" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(campaign.id)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(campaign.id)}>
                        <Settings className="h-4 w-4 mr-2" />
                        Campaign Settings
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {campaigns.length === 0 && (
            <TableRow>
              <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                No campaigns found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}