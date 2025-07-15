"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Download, Printer, FileText } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import type { Invoice } from "@/contexts/invoice-context"

interface InvoicePreviewProps {
  invoice: Invoice
  onBack: () => void
}

export function InvoicePreview({ invoice, onBack }: InvoicePreviewProps) {
  const { user } = useAuth()

  const handleDownloadHTML = () => {
    const htmlContent = generateHTMLInvoice(invoice, user!)
    const blob = new Blob([htmlContent], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `invoice-${invoice.invoiceNumber}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleDownloadCSV = () => {
    const csvContent = generateCSVData([invoice])
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `invoice-${invoice.invoiceNumber}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Hidden in print */}
      <div className="bg-white border-b p-4 print:hidden">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDownloadHTML}>
              <Download className="w-4 h-4 mr-2" />
              HTML
            </Button>
            <Button variant="outline" onClick={handleDownloadCSV}>
              <FileText className="w-4 h-4 mr-2" />
              CSV
            </Button>
            <Button onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
          </div>
        </div>
      </div>

      {/* Invoice Content */}
      <div className="max-w-4xl mx-auto p-8 print:p-0">
        <Card className="print:shadow-none print:border-none">
          <CardContent className="p-8 print:p-6">{renderInvoiceTemplate(invoice, user!)}</CardContent>
        </Card>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:border-none { border: none !important; }
          .print\\:p-0 { padding: 0 !important; }
          .print\\:p-6 { padding: 1.5rem !important; }
          @page { margin: 0.5in; size: A4; }
        }
      `}</style>
    </div>
  )
}

function renderInvoiceTemplate(invoice: Invoice, user: any) {
  const templates = {
    modern: <ModernTemplate invoice={invoice} user={user} />,
    classic: <ClassicTemplate invoice={invoice} user={user} />,
    minimal: <MinimalTemplate invoice={invoice} user={user} />,
  }

  return templates[invoice.template] || templates.modern
}

function ModernTemplate({ invoice, user }: { invoice: Invoice; user: any }) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold text-blue-600 mb-2">INVOICE</h1>
          <p className="text-gray-600">#{invoice.invoiceNumber}</p>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{user.company}</h2>
          <div className="text-gray-600 text-sm">
            <p>{user.name}</p>
            <p>{user.email}</p>
          </div>
        </div>
      </div>

      {/* Invoice Details */}
      <div className="grid grid-cols-2 gap-8">
        <div>
          <h3 className="font-semibold text-gray-900 mb-3 text-blue-600">Bill To:</h3>
          <div className="text-gray-700">
            <p className="font-medium text-lg">{invoice.clientName}</p>
            <p>{invoice.clientAddress}</p>
            <p>{invoice.clientEmail}</p>
            {invoice.clientPhone && <p>{invoice.clientPhone}</p>}
          </div>
        </div>
        <div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Issue Date:</span>
              <span className="font-medium">{new Date(invoice.issueDate).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Due Date:</span>
              <span className="font-medium">{new Date(invoice.dueDate).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(invoice.status)}`}>
                {invoice.status.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div>
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-blue-600">
              <th className="text-left py-3 font-semibold text-gray-900">Description</th>
              <th className="text-center py-3 font-semibold text-gray-900 w-20">Qty</th>
              <th className="text-right py-3 font-semibold text-gray-900 w-24">Rate</th>
              <th className="text-right py-3 font-semibold text-gray-900 w-24">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr key={index} className="border-b border-gray-200">
                <td className="py-3 text-gray-700">{item.description}</td>
                <td className="py-3 text-center text-gray-700">{item.quantity}</td>
                <td className="py-3 text-right text-gray-700">
                  {invoice.currency} {item.rate.toFixed(2)}
                </td>
                <td className="py-3 text-right text-gray-700">
                  {invoice.currency} {item.amount.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-64">
          <div className="space-y-2">
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">
                {invoice.currency} {invoice.subtotal.toFixed(2)}
              </span>
            </div>
            {invoice.discountRate > 0 && (
              <div className="flex justify-between py-2 text-red-600">
                <span>Discount ({invoice.discountRate}%):</span>
                <span>
                  -{invoice.currency} {invoice.discountAmount.toFixed(2)}
                </span>
              </div>
            )}
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Tax ({invoice.taxRate}%):</span>
              <span className="font-medium">
                {invoice.currency} {invoice.taxAmount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between py-3 border-t-2 border-blue-600">
              <span className="text-xl font-bold text-gray-900">Total:</span>
              <span className="text-xl font-bold text-blue-600">
                {invoice.currency} {invoice.total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code and Signature */}
      <div className="grid grid-cols-2 gap-8">
        {invoice.qrCode && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">QR Code:</h3>
            <div className="w-32 h-32 bg-gray-100 border rounded flex items-center justify-center">
              <span className="text-xs text-gray-500">QR Code</span>
            </div>
          </div>
        )}
        {invoice.signature && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Signature:</h3>
            <img
              src={invoice.signature || "/placeholder.svg"}
              alt="Signature"
              className="max-w-full h-20 border rounded"
            />
          </div>
        )}
      </div>

      {/* Notes */}
      {invoice.notes && (
        <div className="border-t pt-6">
          <h3 className="font-semibold text-gray-900 mb-2">Notes:</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{invoice.notes}</p>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-gray-500 text-sm border-t pt-6">
        <p>Thank you for your business!</p>
      </div>
    </div>
  )
}

function ClassicTemplate({ invoice, user }: { invoice: Invoice; user: any }) {
  return (
    <div className="space-y-6 font-serif">
      {/* Header */}
      <div className="text-center border-b-2 border-gray-800 pb-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{user.company}</h1>
        <p className="text-gray-600">{user.email}</p>
        <h2 className="text-2xl font-bold text-gray-800 mt-4">INVOICE</h2>
        <p className="text-gray-600">#{invoice.invoiceNumber}</p>
      </div>

      {/* Rest of classic template... */}
      <div className="text-center text-gray-500">
        <p>Classic template content would be rendered here</p>
      </div>
    </div>
  )
}

function MinimalTemplate({ invoice, user }: { invoice: Invoice; user: any }) {
  return (
    <div className="space-y-8 font-light">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-light text-gray-800">Invoice</h1>
          <p className="text-gray-500">#{invoice.invoiceNumber}</p>
        </div>
        <div className="text-right">
          <p className="font-medium">{user.company}</p>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
      </div>

      {/* Rest of minimal template... */}
      <div className="text-center text-gray-500">
        <p>Minimal template content would be rendered here</p>
      </div>
    </div>
  )
}

function getStatusColor(status: string) {
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

function generateHTMLInvoice(invoice: Invoice, user: any): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice ${invoice.invoiceNumber}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .invoice { max-width: 800px; margin: 0 auto; }
        .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .company { text-align: right; }
        .invoice-details { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f5f5f5; }
        .totals { text-align: right; }
        .total { font-weight: bold; font-size: 1.2em; }
        @media print { body { margin: 0; } }
    </style>
</head>
<body>
    <div class="invoice">
        <div class="header">
            <div>
                <h1>INVOICE</h1>
                <p>#${invoice.invoiceNumber}</p>
            </div>
            <div class="company">
                <h2>${user.company}</h2>
                <p>${user.name}</p>
                <p>${user.email}</p>
            </div>
        </div>
        
        <div class="invoice-details">
            <div>
                <h3>Bill To:</h3>
                <p><strong>${invoice.clientName}</strong></p>
                <p>${invoice.clientAddress}</p>
                <p>${invoice.clientEmail}</p>
                ${invoice.clientPhone ? `<p>${invoice.clientPhone}</p>` : ""}
            </div>
            <div>
                <p><strong>Issue Date:</strong> ${new Date(invoice.issueDate).toLocaleDateString()}</p>
                <p><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</p>
                <p><strong>Status:</strong> ${invoice.status.toUpperCase()}</p>
            </div>
        </div>
        
        <table>
            <thead>
                <tr>
                    <th>Description</th>
                    <th>Qty</th>
                    <th>Rate</th>
                    <th>Amount</th>
                </tr>
            </thead>
            <tbody>
                ${invoice.items
                  .map(
                    (item) => `
                    <tr>
                        <td>${item.description}</td>
                        <td>${item.quantity}</td>
                        <td>${invoice.currency} ${item.rate.toFixed(2)}</td>
                        <td>${invoice.currency} ${item.amount.toFixed(2)}</td>
                    </tr>
                `,
                  )
                  .join("")}
            </tbody>
        </table>
        
        <div class="totals">
            <p>Subtotal: ${invoice.currency} ${invoice.subtotal.toFixed(2)}</p>
            ${invoice.discountRate > 0 ? `<p>Discount (${invoice.discountRate}%): -${invoice.currency} ${invoice.discountAmount.toFixed(2)}</p>` : ""}
            <p>Tax (${invoice.taxRate}%): ${invoice.currency} ${invoice.taxAmount.toFixed(2)}</p>
            <p class="total">Total: ${invoice.currency} ${invoice.total.toFixed(2)}</p>
        </div>
        
        ${
          invoice.notes
            ? `
            <div style="margin-top: 30px;">
                <h3>Notes:</h3>
                <p>${invoice.notes}</p>
            </div>
        `
            : ""
        }
        
        <div style="text-align: center; margin-top: 40px; color: #666;">
            <p>Thank you for your business!</p>
        </div>
    </div>
</body>
</html>
  `
}

function generateCSVData(invoices: Invoice[]): string {
  const headers = [
    "Invoice Number",
    "Client Name",
    "Client Email",
    "Issue Date",
    "Due Date",
    "Status",
    "Currency",
    "Subtotal",
    "Tax Rate",
    "Tax Amount",
    "Discount Rate",
    "Discount Amount",
    "Total",
    "Notes",
  ]

  const rows = invoices.map((invoice) => [
    invoice.invoiceNumber,
    invoice.clientName,
    invoice.clientEmail,
    invoice.issueDate,
    invoice.dueDate,
    invoice.status,
    invoice.currency,
    invoice.subtotal.toFixed(2),
    invoice.taxRate.toString(),
    invoice.taxAmount.toFixed(2),
    invoice.discountRate.toString(),
    invoice.discountAmount.toFixed(2),
    invoice.total.toFixed(2),
    `"${invoice.notes.replace(/"/g, '""')}"`,
  ])

  return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")
}
