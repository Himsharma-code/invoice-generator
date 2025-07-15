"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Mail, Send, AlertCircle } from "lucide-react"
import type { Invoice, EmailLog } from "@/types/invoice"

interface EmailDialogProps {
  invoice: Invoice
  isOpen: boolean
  onClose: () => void
  onEmailSent: (emailLog: EmailLog) => void
}

export function EmailDialog({ invoice, isOpen, onClose, onEmailSent }: EmailDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    to: invoice.clientEmail,
    subject: `Invoice ${invoice.invoiceNumber} from ${invoice.companyName}`,
    message: `Dear ${invoice.clientName},

Please find your invoice ${invoice.invoiceNumber} details below. Payment is due by ${new Date(invoice.dueDate).toLocaleDateString()}.

If you have any questions, please don't hesitate to contact us.

Thank you for your business!

Best regards,
${invoice.companyName}`,
  })

  const handleSendEmail = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/send-invoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invoice: {
            ...invoice,
            clientEmail: formData.to,
          },
          customMessage: formData.message,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to send email")
      }

      // Create email log
      const emailLog: EmailLog = {
        id: Date.now().toString(),
        sentAt: new Date().toISOString(),
        recipient: formData.to,
        subject: formData.subject,
        status: "sent",
      }

      onEmailSent(emailLog)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send email")

      // Create failed email log
      const emailLog: EmailLog = {
        id: Date.now().toString(),
        sentAt: new Date().toISOString(),
        recipient: formData.to,
        subject: formData.subject,
        status: "failed",
        error: err instanceof Error ? err.message : "Unknown error",
      }

      onEmailSent(emailLog)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Send Invoice via Email
          </DialogTitle>
          <DialogDescription>Send invoice {invoice.invoiceNumber} to your client via email.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="to">To</Label>
            <Input
              id="to"
              type="email"
              value={formData.to}
              onChange={(e) => setFormData({ ...formData, to: e.target.value })}
              placeholder="client@example.com"
            />
          </div>

          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={8}
              placeholder="Enter your message..."
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          {!process.env.NEXT_PUBLIC_RESEND_CONFIGURED && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <AlertCircle className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-yellow-700">
                Email service not configured. Add RESEND_API_KEY to environment variables.
              </span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSendEmail} disabled={isLoading} className="flex items-center gap-2">
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send Email
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
