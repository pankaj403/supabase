"use client"

import { useState, useMemo } from "react"
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
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import {
  MoreVertical,
  ArrowUpDown,
  History,
  Clock,
  Search,
  Filter,
} from "lucide-react"
import { CallButton } from "@/components/calls/call-button"
import { formatPhoneNumber } from "@/lib/utils"
import { Customer } from "@/types"
import { format } from "date-fns"
import { updateCustomer } from "@/lib/airtable/customers"
import { toast } from "sonner"
import { CallDialog } from "@/components/calls/call-dialog"

interface LeadTableProps {
  leads: Customer[]
  onViewHistory: (lead: Customer) => void
  onEditLead: (lead: Customer) => void
  clientId: string
  campaignId?: string
}

type SortField = "name" | "status" | "lastContact" | "importTime"
type SortOrder = "asc" | "desc"

const statusColors = {
  pending: "secondary",
  contacted: "default",
  success: "default",
  failed: "destructive",
} as const

export function LeadTable({ 
  leads, 
  onViewHistory, 
  onEditLead,
  clientId,
  campaignId
}: LeadTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState<SortField>("importTime")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")
  const [statusFilter, setStatusFilter] = useState<Customer["status"] | "all">("all")
  const [selectedLead, setSelectedLead] = useState<Customer | null>(null)
  const [isCallDialogOpen, setIsCallDialogOpen] = useState(false)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  const handleStatusChange = async (lead: Customer, newStatus: Customer["status"]) => {
    try {
      const response = await updateCustomer(lead.id, { status: newStatus })
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to update status')
      }

      // Update local state through parent component
      onEditLead(response.data)
      toast.success('Status updated successfully')
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
    }
  }

  const handleLeadNameClick = (lead: Customer) => {
    setSelectedLead(lead)
    setIsCallDialogOpen(true)
  }

  const handleUpdateLead = async (updatedFields: Partial<Customer>) => {
    if (selectedLead) {
      try {
        const response = await updateCustomer(selectedLead.id, updatedFields)
        
        if (!response.success || !response.data) {
          throw new Error(response.error || 'Failed to update lead')
        }

        // Update local state through parent component
        onEditLead(response.data)
        toast.success('Lead updated successfully')
      } catch (error) {
        console.error('Error updating lead:', error)
        toast.error('Failed to update lead')
      }
    }
  }

  const filteredAndSortedLeads = useMemo(() => {
    return leads
      .filter((lead) => {
        const name = lead.name || ''
        const phone = lead.phone || ''
        const notes = lead.notes || ''
        const status = lead.status || 'pending'

        const matchesSearch = 
          name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          phone.includes(searchQuery) ||
          notes.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesStatus = 
          statusFilter === "all" || status === statusFilter

        return matchesSearch && matchesStatus
      })
      .sort((a, b) => {
        let comparison = 0
        
        const nameA = a.name || ''
        const nameB = b.name || ''
        const statusA = a.status || 'pending'
        const statusB = b.status || 'pending'
        const lastContactA = a.lastContact || ''
        const lastContactB = b.lastContact || ''
        const importTimeA = a.importTime || ''
        const importTimeB = b.importTime || ''
        
        switch (sortField) {
          case "name":
            comparison = nameA.localeCompare(nameB)
            break
          case "status":
            comparison = statusA.localeCompare(statusB)
            break
          case "lastContact":
            comparison = lastContactA.localeCompare(lastContactB)
            break
          case "importTime":
            comparison = importTimeA.localeCompare(importTimeB)
            break
        }

        return sortOrder === "asc" ? comparison : -comparison
      })
  }, [leads, searchQuery, sortField, sortOrder, statusFilter])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-[300px]"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuLabel>Status</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                All
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("pending")}>
                Pending
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("contacted")}>
                Contacted
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("success")}>
                Success
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("failed")}>
                Failed
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                onClick={() => handleSort("name")} 
                className="cursor-pointer"
              >
                <div className="flex items-center">
                  Name 
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>Contact</TableHead>
              <TableHead 
                onClick={() => handleSort("status")} 
                className="cursor-pointer"
              >
                <div className="flex items-center">
                  Status 
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead 
                onClick={() => handleSort("lastContact")} 
                className="cursor-pointer"
              >
                <div className="flex items-center">
                  Last Contact 
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedLeads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell 
                  onClick={() => handleLeadNameClick(lead)}
                  className="font-medium cursor-pointer hover:underline"
                >
                  {lead.name}
                </TableCell>
                <TableCell>
                  <Button
                    variant="link"
                    className="p-0 h-auto font-normal"
                    onClick={() => onViewHistory(lead)}
                  >
                    {formatPhoneNumber(lead.phone)}
                  </Button>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="p-0 h-auto">
                        <Badge variant={statusColors[lead.status || 'pending']}>
                          {lead.status || 'pending'}
                        </Badge>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem onClick={() => handleStatusChange(lead, "pending")}>
                        Pending
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusChange(lead, "contacted")}>
                        Contacted
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusChange(lead, "success")}>
                        Success
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusChange(lead, "failed")}>
                        Failed
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
                <TableCell>{lead.lastContact || 'N/A'}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEditLead(lead)}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onViewHistory(lead)}>
                        <History className="h-4 w-4 mr-2" /> View History
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {selectedLead && (
        <CallDialog 
          open={isCallDialogOpen}
          onOpenChange={setIsCallDialogOpen}
          lead={selectedLead}
          onUpdateLead={handleUpdateLead}
          clientId={clientId}
          campaignId={campaignId}
        />
      )}
    </div>
  )
}