"use client"

import { Button } from "@/components/ui/button"
import { Download, ArrowLeft, Mail } from "lucide-react"
import type { Invoice, EmailLog } from "@/types/invoice"
import { EmailDialog } from "@/components/email-dialog"
import { EmailHistory } from "@/components/email-history"
import { useState } from "react"

interface InvoicePreviewProps {
  invoice: Invoice
  onBack: () => void
}

export function InvoicePreview({ invoice, onBack }: InvoicePreviewProps) {
  const [showEmailDialog, setShowEmailDialog] = useState(false)

  const handleDownload = () => {
    window.print()
  }

  const handleEmailSent = (emailLog: EmailLog) => {
    // Update invoice with email log
    const updatedInvoice = {
      ...invoice,
      emailLogs: [...(invoice.emailLogs || []), emailLog],
      lastEmailSent: emailLog.sentAt,
      status: emailLog.status === "sent" ? ("sent" as const) : invoice.status,
    }

    // Save to localStorage
    const savedInvoices = localStorage.getItem("invoices")
    if (savedInvoices) {
      const invoices = JSON.parse(savedInvoices)
      const updatedInvoices = invoices.map((inv: any) => (inv.id === invoice.id ? updatedInvoice : inv))
      localStorage.setItem("invoices", JSON.stringify(updatedInvoices))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Hidden in print */}
      <div className="bg-white border-b p-4 print:hidden">
        <div className="container mx-auto flex justify-between items-center">
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Invoices
          </Button>
          <Button onClick={() => setShowEmailDialog(true)} variant="outline" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Send Email
          </Button>
          <Button onClick={handleDownload} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Invoice Content */}
      <div className="container mx-auto p-8 print:p-0">
        <div className="bg-white shadow-lg print:shadow-none max-w-4xl mx-auto">
          <div className="p-8 print:p-6">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">INVOICE</h1>
                <p className="text-gray-600">#{invoice.invoiceNumber}</p>
              </div>
              <div className="text-right">
                <h2 className="text-xl font-bold text-gray-900 mb-2">{invoice.companyName}</h2>
                <div className="text-gray-600 text-sm">
                  <p>{invoice.companyAddress}</p>
                  <p>{invoice.companyEmail}</p>
                  <p>{invoice.companyPhone}</p>
                </div>
              </div>
            </div>

            {/* Invoice Details */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Bill To:</h3>
                <div className="text-gray-700">
                  <p className="font-medium">{invoice.clientName}</p>
                  <p>{invoice.clientAddress}</p>
                  <p>{invoice.clientEmail}</p>
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
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        invoice.status === "paid"
                          ? "bg-green-100 text-green-800"
                          : invoice.status === "sent"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {invoice.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-8">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-300">
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
                      <td className="py-3 text-right text-gray-700">${item.rate.toFixed(2)}</td>
                      <td className="py-3 text-right text-gray-700">${item.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end mb-8">
              <div className="w-64">
                <div className="space-y-2">
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">${invoice.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Tax:</span>
                    <span className="font-medium">${invoice.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-3 border-t-2 border-gray-300">
                    <span className="text-lg font-bold text-gray-900">Total:</span>
                    <span className="text-lg font-bold text-gray-900">${invoice.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div className="border-t pt-6">
                <h3 className="font-semibold text-gray-900 mb-2">Notes:</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{invoice.notes}</p>
              </div>
            )}

            {/* Footer */}
            <div className="mt-12 pt-6 border-t text-center text-gray-500 text-sm">
              <p>Thank you for your business!</p>
            </div>
          </div>
        </div>
      </div>

      <EmailDialog
        invoice={invoice}
        isOpen={showEmailDialog}
        onClose={() => setShowEmailDialog(false)}
        onEmailSent={handleEmailSent}
      />

      {/* Email History - only show if there are email logs */}
      {invoice.emailLogs && invoice.emailLogs.length > 0 && (
        <div className="container mx-auto p-8 print:hidden">
          <div className="max-w-4xl mx-auto">
            <EmailHistory emailLogs={invoice.emailLogs} />
          </div>
        </div>
      )}

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:p-0 {
            padding: 0 !important;
          }
          .print\\:p-6 {
            padding: 1.5rem !important;
          }
          @page {
            margin: 0.5in;
            size: A4;
          }
        }
      `}</style>
    </div>
  )
}
