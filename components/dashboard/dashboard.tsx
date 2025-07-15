"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  Search,
  Filter,
  Download,
  LogOut,
  Eye,
  Edit,
  Users,
  FileText,
  DollarSign,
  TrendingUp,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useInvoices } from "@/contexts/invoice-context"
import { InvoiceForm } from "@/components/invoice/invoice-form"
import { InvoicePreview } from "@/components/invoice/invoice-preview"
import { ClientManager } from "@/components/client/client-manager"
import { Analytics } from "@/components/analytics/analytics"
import type { Invoice } from "@/contexts/invoice-context"

type View = "dashboard" | "invoices" | "clients" | "analytics" | "create" | "edit" | "preview"

export function Dashboard() {
  const { user, logout } = useAuth()
  const { invoices, clients, searchInvoices, filterInvoices, exportData } = useInvoices()
  const [currentView, setCurrentView] = useState<View>("dashboard")
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    status: "",
    dateFrom: "",
    dateTo: "",
    minAmount: "",
    maxAmount: "",
  })

  const filteredInvoices = searchQuery ? searchInvoices(searchQuery) : filterInvoices(filters)

  const stats = {
    totalInvoices: invoices.length,
    totalRevenue: invoices.reduce((sum, inv) => sum + inv.total, 0),
    paidInvoices: invoices.filter((inv) => inv.status === "paid").length,
    pendingInvoices: invoices.filter((inv) => inv.status === "sent").length,
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "sent":
        return "bg-blue-100 text-blue-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const renderContent = () => {
    switch (currentView) {
      case "create":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Create New Invoice</h1>
              <Button variant="outline" onClick={() => setCurrentView("invoices")}>
                Back to Invoices
              </Button>
            </div>
            <InvoiceForm onComplete={() => setCurrentView("invoices")} />
          </div>
        )

      case "edit":
        return selectedInvoice ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Edit Invoice</h1>
              <Button variant="outline" onClick={() => setCurrentView("invoices")}>
                Back to Invoices
              </Button>
            </div>
            <InvoiceForm invoice={selectedInvoice} onComplete={() => setCurrentView("invoices")} />
          </div>
        ) : null

      case "preview":
        return selectedInvoice ? (
          <InvoicePreview invoice={selectedInvoice} onBack={() => setCurrentView("invoices")} />
        ) : null

      case "clients":
        return <ClientManager />

      case "analytics":
        return <Analytics />

      case "invoices":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Invoices</h1>
              <Button onClick={() => setCurrentView("create")}>
                <Plus className="w-4 h-4 mr-2" />
                New Invoice
              </Button>
            </div>

            {/* Search and Filters */}
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search invoices..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
              <Button variant="outline" onClick={exportData}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <Card>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                      className="px-3 py-2 border rounded-md"
                    >
                      <option value="">All Status</option>
                      <option value="draft">Draft</option>
                      <option value="sent">Sent</option>
                      <option value="paid">Paid</option>
                      <option value="overdue">Overdue</option>
                    </select>
                    <Input
                      type="date"
                      placeholder="From Date"
                      value={filters.dateFrom}
                      onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                    />
                    <Input
                      type="date"
                      placeholder="To Date"
                      value={filters.dateTo}
                      onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                    />
                    <Input
                      type="number"
                      placeholder="Min Amount"
                      value={filters.minAmount}
                      onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })}
                    />
                    <Input
                      type="number"
                      placeholder="Max Amount"
                      value={filters.maxAmount}
                      onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value })}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Invoice List */}
            <Card>
              <CardContent className="p-0">
                {filteredInvoices.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No invoices found</p>
                    <Button onClick={() => setCurrentView("create")}>Create your first invoice</Button>
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredInvoices.map((invoice) => (
                      <div key={invoice.id} className="p-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold">{invoice.invoiceNumber}</h3>
                              <Badge className={getStatusColor(invoice.status)}>{invoice.status}</Badge>
                            </div>
                            <div className="text-sm text-gray-600">
                              <p>{invoice.clientName}</p>
                              <p>Due: {new Date(invoice.dueDate).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="text-right mr-4">
                            <div className="font-semibold text-lg">
                              {invoice.currency} {invoice.total.toFixed(2)}
                            </div>
                            <div className="text-sm text-gray-600">
                              {new Date(invoice.createdAt).toLocaleDateString()}
                            </div>
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
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )

      default: // dashboard
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.name}</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <FileText className="w-8 h-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Invoices</p>
                      <p className="text-2xl font-bold">{stats.totalInvoices}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <DollarSign className="w-8 h-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                      <p className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <TrendingUp className="w-8 h-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Paid Invoices</p>
                      <p className="text-2xl font-bold">{stats.paidInvoices}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="w-8 h-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Clients</p>
                      <p className="text-2xl font-bold">{clients.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button onClick={() => setCurrentView("create")} className="h-20">
                    <div className="text-center">
                      <Plus className="w-6 h-6 mx-auto mb-2" />
                      <div>Create Invoice</div>
                    </div>
                  </Button>
                  <Button variant="outline" onClick={() => setCurrentView("clients")} className="h-20">
                    <div className="text-center">
                      <Users className="w-6 h-6 mx-auto mb-2" />
                      <div>Manage Clients</div>
                    </div>
                  </Button>
                  <Button variant="outline" onClick={() => setCurrentView("analytics")} className="h-20">
                    <div className="text-center">
                      <TrendingUp className="w-6 h-6 mx-auto mb-2" />
                      <div>View Analytics</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Invoices */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Invoices</CardTitle>
                  <Button variant="outline" onClick={() => setCurrentView("invoices")}>
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {invoices.slice(0, 5).map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                    <div>
                      <p className="font-medium">{invoice.invoiceNumber}</p>
                      <p className="text-sm text-gray-600">{invoice.clientName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {invoice.currency} {invoice.total.toFixed(2)}
                      </p>
                      <Badge className={getStatusColor(invoice.status)} size="sm">
                        {invoice.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Invoice Generator</h1>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              <button
                onClick={() => setCurrentView("dashboard")}
                className={`px-3 py-2 text-sm font-medium ${
                  currentView === "dashboard"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setCurrentView("invoices")}
                className={`px-3 py-2 text-sm font-medium ${
                  ["invoices", "create", "edit", "preview"].includes(currentView)
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Invoices
              </button>
              <button
                onClick={() => setCurrentView("clients")}
                className={`px-3 py-2 text-sm font-medium ${
                  currentView === "clients"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Clients
              </button>
              <button
                onClick={() => setCurrentView("analytics")}
                className={`px-3 py-2 text-sm font-medium ${
                  currentView === "analytics"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Analytics
              </button>
            </nav>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">{user?.email}</span>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{renderContent()}</main>
    </div>
  )
}
