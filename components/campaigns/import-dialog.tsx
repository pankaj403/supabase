"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload } from "lucide-react"
import { parseCustomerCSV } from "@/lib/csv-parser"
import { Customer } from "@/types"

interface ImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (customers: Omit<Customer, 'id'>[]) => Promise<void>
}

export function ImportDialog({ open, onOpenChange, onImport }: ImportDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setIsLoading(true)
    setError(null)

    try {
      const result = await parseCustomerCSV(file)
      
      if (!result.success || !result.data) {
        throw new Error(result.errors?.[0] || 'Failed to parse CSV file')
      }

      await onImport(result.data)
      onOpenChange(false)
      setFile(null)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to import contacts')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Import Contacts</DialogTitle>
          <DialogDescription>
            Upload a CSV file containing contact information. The file must include &quot;Name&quot; and &quot;Phone&quot; columns.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="file">CSV File</Label>
              <Input
                id="file"
                type="file"
                accept=".csv"
                onChange={(e) => {
                  setFile(e.target.files?.[0] ?? null)
                  setError(null)
                }}
                disabled={isLoading}
              />
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              <p className="text-sm text-muted-foreground">
                Phone numbers must be in Australian format (e.g., 0412345678 or +61412345678)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="submit" 
              disabled={!file || isLoading}
              className="relative overflow-hidden bg-primary/10 backdrop-blur-sm border border-primary/20"
            >
              <Upload className="mr-2 h-4 w-4" />
              {isLoading ? "Importing..." : "Import"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}