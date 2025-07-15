"use client"

import { useState, useEffect } from "react"
import { AuthProvider, useAuth } from "@/contexts/auth-context"
import { InvoiceProvider } from "@/contexts/invoice-context"
import { LoginForm } from "@/components/auth/login-form"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Eye, Edit, Mail } from "lucide-react"
import { InvoiceForm } from "@/components/invoice-form"
import { InvoicePreview } from "@/components/invoice-preview"
import type { Invoice } from "@/types/invoice"

function InvoiceGenerator() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "sent" | "paid">("all")
  const [currentView, setCurrentView] = useState<"list" | "create" | "edit" | "preview">("list")
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)

  // Load invoices from localStorage on mount
  useEffect(() => {
    const savedInvoices = localStorage.getItem("invoices")
    if (savedInvoices) {
      setInvoices(JSON.parse(savedInvoices))
    }
  }, [])

  // Save invoices to localStorage whenever invoices change
  useEffect(() => {
    localStorage.setItem("invoices", JSON.stringify(invoices))
  }, [invoices])

  const handleCreateInvoice = (invoice: Omit<Invoice, "id" | "createdAt">) => {
    const newInvoice: Invoice = {
      ...invoice,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    setInvoices((prev) => [newInvoice, ...prev])
    setCurrentView("list")
  }

  const handleUpdateInvoice = (updatedInvoice: Invoice) => {
    setInvoices((prev) => prev.map((inv) => (inv.id === updatedInvoice.id ? updatedInvoice : inv)))
    setCurrentView("list")
  }

  const handleDeleteInvoice = (id: string) => {
    setInvoices((prev) => prev.filter((inv) => inv.id !== id))
  }

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "sent":
        return "bg-blue-100 text-blue-800"
      case "draft":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (currentView === "create") {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Button variant="outline" onClick={() => setCurrentView("list")} className="mb-4">
            ← Back to Invoices
          </Button>
          <h1 className="text-3xl font-bold">Create New Invoice</h1>
        </div>
        <InvoiceForm onSubmit={handleCreateInvoice} />
      </div>
    )
  }

  if (currentView === "edit" && selectedInvoice) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Button variant="outline" onClick={() => setCurrentView("list")} className="mb-4">
            ← Back to Invoices
          </Button>
          <h1 className="text-3xl font-bold">Edit Invoice</h1>
        </div>
        <InvoiceForm invoice={selectedInvoice} onSubmit={handleUpdateInvoice} />
      </div>
    )
  }

  if (currentView === "preview" && selectedInvoice) {
    return <InvoicePreview invoice={selectedInvoice} onBack={() => setCurrentView("list")} />
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Invoice Generator</h1>
          <p className="text-gray-600">Create, manage, and download professional invoices</p>
        </div>
        <Button onClick={() => setCurrentView("create")} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Invoice
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-3 py-2 border rounded-md bg-white"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="paid">Paid</option>
        </select>
      </div>

      {/* Invoice Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{invoices.length}</div>
            <div className="text-sm text-gray-600">Total Invoices</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {invoices.filter((inv) => inv.status === "paid").length}
            </div>
            <div className="text-sm text-gray-600">Paid</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {invoices.filter((inv) => inv.status === "sent").length}
            </div>
            <div className="text-sm text-gray-600">Sent</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-600">
              {invoices.filter((inv) => inv.status === "draft").length}
            </div>
            <div className="text-sm text-gray-600">Draft</div>
          </CardContent>
        </Card>
      </div>

      {/* Invoice List */}
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No invoices found</p>
              <Button onClick={() => setCurrentView("create")}>Create your first invoice</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{invoice.invoiceNumber}</h3>
                      <Badge className={getStatusColor(invoice.status)}>{invoice.status}</Badge>
                      {invoice.lastEmailSent && (
                        <Badge variant="outline" className="text-xs">
                          <Mail className="w-3 h-3 mr-1" />
                          Emailed
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>{invoice.clientName}</p>
                      <p>Due: {new Date(invoice.dueDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right mr-4">
                    <div className="font-semibold text-lg">${invoice.total.toFixed(2)}</div>
                    <div className="text-sm text-gray-600">{new Date(invoice.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedInvoice(invoice)
                        setCurrentView("preview")
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedInvoice(invoice)
                        setCurrentView("edit")
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function AppContent() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  return (
    <InvoiceProvider>
      <InvoiceGenerator />
    </InvoiceProvider>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
