"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useAuth } from "./auth-context"

export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  rate: number
  amount: number
}

export interface Invoice {
  id: string
  userId: string
  invoiceNumber: string
  clientId: string
  clientName: string
  clientEmail: string
  clientAddress: string
  clientPhone?: string
  issueDate: string
  dueDate: string
  status: "draft" | "sent" | "paid" | "overdue"
  items: InvoiceItem[]
  subtotal: number
  taxRate: number
  taxAmount: number
  discountRate: number
  discountAmount: number
  total: number
  notes: string
  template: "modern" | "classic" | "minimal"
  currency: string
  createdAt: string
  updatedAt: string
  signature?: string
  qrCode?: string
}

export interface Client {
  id: string
  userId: string
  name: string
  email: string
  address: string
  phone?: string
  company?: string
  createdAt: string
}

interface InvoiceContextType {
  invoices: Invoice[]
  clients: Client[]
  createInvoice: (invoice: Omit<Invoice, "id" | "userId" | "createdAt" | "updatedAt">) => void
  updateInvoice: (id: string, invoice: Partial<Invoice>) => void
  deleteInvoice: (id: string) => void
  createClient: (client: Omit<Client, "id" | "userId" | "createdAt">) => void
  updateClient: (id: string, client: Partial<Client>) => void
  deleteClient: (id: string) => void
  searchInvoices: (query: string) => Invoice[]
  filterInvoices: (filters: any) => Invoice[]
  exportData: () => void
  importData: (data: any) => void
  generateBackup: () => void
}

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined)

export function useInvoices() {
  const context = useContext(InvoiceContext)
  if (context === undefined) {
    throw new Error("useInvoices must be used within an InvoiceProvider")
  }
  return context
}

export function InvoiceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [clients, setClients] = useState<Client[]>([])

  // Load data from localStorage
  useEffect(() => {
    if (user) {
      const savedInvoices = localStorage.getItem(`invoices_${user.id}`)
      const savedClients = localStorage.getItem(`clients_${user.id}`)

      if (savedInvoices) {
        setInvoices(JSON.parse(savedInvoices))
      }

      if (savedClients) {
        setClients(JSON.parse(savedClients))
      }
    }
  }, [user])

  // Save data to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem(`invoices_${user.id}`, JSON.stringify(invoices))
    }
  }, [invoices, user])

  useEffect(() => {
    if (user) {
      localStorage.setItem(`clients_${user.id}`, JSON.stringify(clients))
    }
  }, [clients, user])

  // Auto-backup every 5 minutes
  useEffect(() => {
    const interval = setInterval(
      () => {
        if (user && (invoices.length > 0 || clients.length > 0)) {
          generateBackup()
        }
      },
      5 * 60 * 1000,
    )

    return () => clearInterval(interval)
  }, [user, invoices, clients])

  const createInvoice = (invoiceData: Omit<Invoice, "id" | "userId" | "createdAt" | "updatedAt">) => {
    const newInvoice: Invoice = {
      ...invoiceData,
      id: Date.now().toString(),
      userId: user!.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setInvoices((prev) => [newInvoice, ...prev])
  }

  const updateInvoice = (id: string, updates: Partial<Invoice>) => {
    setInvoices((prev) =>
      prev.map((invoice) =>
        invoice.id === id ? { ...invoice, ...updates, updatedAt: new Date().toISOString() } : invoice,
      ),
    )
  }

  const deleteInvoice = (id: string) => {
    setInvoices((prev) => prev.filter((invoice) => invoice.id !== id))
  }

  const createClient = (clientData: Omit<Client, "id" | "userId" | "createdAt">) => {
    const newClient: Client = {
      ...clientData,
      id: Date.now().toString(),
      userId: user!.id,
      createdAt: new Date().toISOString(),
    }
    setClients((prev) => [newClient, ...prev])
  }

  const updateClient = (id: string, updates: Partial<Client>) => {
    setClients((prev) => prev.map((client) => (client.id === id ? { ...client, ...updates } : client)))
  }

  const deleteClient = (id: string) => {
    setClients((prev) => prev.filter((client) => client.id !== id))
  }

  const searchInvoices = (query: string): Invoice[] => {
    if (!query.trim()) return invoices

    const lowercaseQuery = query.toLowerCase()
    return invoices.filter(
      (invoice) =>
        invoice.invoiceNumber.toLowerCase().includes(lowercaseQuery) ||
        invoice.clientName.toLowerCase().includes(lowercaseQuery) ||
        invoice.notes.toLowerCase().includes(lowercaseQuery),
    )
  }

  const filterInvoices = (filters: any): Invoice[] => {
    return invoices.filter((invoice) => {
      if (filters.status && invoice.status !== filters.status) return false
      if (filters.dateFrom && new Date(invoice.issueDate) < new Date(filters.dateFrom)) return false
      if (filters.dateTo && new Date(invoice.issueDate) > new Date(filters.dateTo)) return false
      if (filters.minAmount && invoice.total < filters.minAmount) return false
      if (filters.maxAmount && invoice.total > filters.maxAmount) return false
      return true
    })
  }

  const exportData = () => {
    const data = {
      invoices,
      clients,
      exportDate: new Date().toISOString(),
      version: "1.0",
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `invoice-data-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const importData = (data: any) => {
    if (data.invoices) {
      setInvoices(data.invoices)
    }
    if (data.clients) {
      setClients(data.clients)
    }
  }

  const generateBackup = () => {
    const backupData = {
      invoices,
      clients,
      user: user!,
      backupDate: new Date().toISOString(),
    }

    localStorage.setItem(`backup_${user!.id}_${Date.now()}`, JSON.stringify(backupData))

    // Keep only last 5 backups
    const backupKeys = Object.keys(localStorage).filter((key) => key.startsWith(`backup_${user!.id}_`))
    if (backupKeys.length > 5) {
      backupKeys
        .sort()
        .slice(0, -5)
        .forEach((key) => localStorage.removeItem(key))
    }
  }

  return (
    <InvoiceContext.Provider
      value={{
        invoices,
        clients,
        createInvoice,
        updateInvoice,
        deleteInvoice,
        createClient,
        updateClient,
        deleteClient,
        searchInvoices,
        filterInvoices,
        exportData,
        importData,
        generateBackup,
      }}
    >
      {children}
    </InvoiceContext.Provider>
  )
}
