"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Download, Upload, Plus } from "lucide-react"
import { ImportDialog } from "./import-dialog"
import { LeadDialog } from "./lead-dialog"
import { CallHistoryDialog } from "./call-history-dialog"
import { LeadTable } from "@/components/leads/lead-table"
import { toast } from "sonner"
import { Customer } from "@/types"
import { getCustomers, createCustomer, updateCustomer } from "@/lib/airtable"
import { generateCustomerCSV } from "@/lib/csv-parser"

interface LeadManagementProps {
  campaignId: string
  clientId: string
}

export function LeadManagement({ campaignId, clientId }: LeadManagementProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [leadDialogOpen, setLeadDialogOpen] = useState(false)
  const [callHistoryOpen, setCallHistoryOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>(undefined)

  const loadCustomers = useCallback(async () => {
    try {
      const response = await getCustomers({ campaignId: [campaignId] })
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to load contacts')
      }

      setCustomers(response.data)
    } catch (error) {
      console.error('Error loading customers:', error)
      toast.error('Failed to load contacts')
    } finally {
      setIsLoading(false)
    }
  }, [campaignId])

  useEffect(() => {
    loadCustomers()
  }, [loadCustomers])

  const handleImport = async (newCustomers: Omit<Customer, 'id'>[]) => {
    try {
      const customersWithCampaign = newCustomers.map(customer => ({
        ...customer,
        campaignId
      }))

      const response = await createCustomer(customersWithCampaign[0])

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to import contacts')
      }

      const importedCustomer = response.data
      setCustomers(prev => [...prev, importedCustomer])
      toast.success(`1 contact imported successfully`)
    } catch (error) {
      console.error('Import error:', error)
      toast.error('Failed to import contacts')
    }
  }

  const handleExport = () => {
    try {
      const csvContent = generateCustomerCSV(customers)
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      
      link.setAttribute('href', url)
      link.setAttribute('download', `campaign-${campaignId}-contacts.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success('Contacts exported successfully')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export contacts')
    }
  }

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setLeadDialogOpen(true)
  }

  const handleViewHistory = (customer: Customer) => {
    setSelectedCustomer(customer)
    setCallHistoryOpen(true)
  }

  const handleSaveCustomer = async (updatedCustomer: Partial<Customer>) => {
    try {
      if (selectedCustomer) {
        const response = await updateCustomer(selectedCustomer.id, {
          ...updatedCustomer,
          campaignId
        })

        if (!response.success || !response.data) {
          throw new Error(response.error || 'Failed to update contact')
        }

        setCustomers(prev => 
          prev.map(c => c.id === selectedCustomer.id ? response.data! : c)
        )
        toast.success('Contact updated successfully')
      } else {
        const response = await createCustomer({
          ...updatedCustomer as Omit<Customer, 'id'>,
          campaignId
        })

        if (!response.success || !response.data) {
          throw new Error(response.error || 'Failed to create contact')
        }

        const newCustomer = response.data
        setCustomers(prev => [...prev, newCustomer])
        toast.success('Contact created successfully')
      }

      setLeadDialogOpen(false)
      setSelectedCustomer(undefined)
    } catch (error) {
      console.error('Error saving customer:', error)
      toast.error('Failed to save contact')
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Contact Management</CardTitle>
              <CardDescription>
                Manage and track campaign contacts
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => setImportDialogOpen(true)}
                className="relative overflow-hidden bg-primary/10 backdrop-blur-sm border border-primary/20 shadow-[0_0_15px_rgba(255,100,0,0.15)] hover:shadow-[0_0_25px_rgba(255,100,0,0.25)] hover:bg-primary/20 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent animate-pulse" />
                <Upload className="mr-2 h-4 w-4" />
                Import
              </Button>
              <Button 
                variant="outline"
                onClick={handleExport}
                className="relative overflow-hidden bg-primary/10 backdrop-blur-sm border border-primary/20 shadow-[0_0_15px_rgba(255,100,0,0.15)] hover:shadow-[0_0_25px_rgba(255,100,0,0.25)] hover:bg-primary/20 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent animate-pulse" />
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button 
                onClick={() => {
                  setSelectedCustomer(undefined)
                  setLeadDialogOpen(true)
                }}
                className="relative overflow-hidden bg-primary/10 backdrop-blur-sm border border-primary/20 shadow-[0_0_15px_rgba(255,100,0,0.15)] hover:shadow-[0_0_25px_rgba(255,100,0,0.25)] hover:bg-primary/20 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent animate-pulse" />
                <Plus className="mr-2 h-4 w-4" />
                Add Contact
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-primary/5 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : (
            <LeadTable
              leads={customers}
              onViewHistory={handleViewHistory}
              onEditLead={handleEditCustomer}
              clientId={clientId}
              campaignId={campaignId}
            />
          )}
        </CardContent>
      </Card>

      <ImportDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onImport={handleImport}
      />

      <LeadDialog
        open={leadDialogOpen}
        onOpenChange={setLeadDialogOpen}
        lead={selectedCustomer}
        onSave={handleSaveCustomer}
      />

      {selectedCustomer && (
        <CallHistoryDialog
          open={callHistoryOpen}
          onOpenChange={setCallHistoryOpen}
          phoneNumber={selectedCustomer.phone}
        />
      )}
    </>
  )
}