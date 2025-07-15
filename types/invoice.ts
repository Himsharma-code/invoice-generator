export interface InvoiceItem {
  description: string
  quantity: number
  rate: number
  amount: number
}

export interface EmailLog {
  id: string
  sentAt: string
  recipient: string
  subject: string
  status: "sent" | "failed"
  error?: string
}

export interface Invoice {
  id: string
  invoiceNumber: string
  clientName: string
  clientEmail: string
  clientAddress: string
  companyName: string
  companyAddress: string
  companyEmail: string
  companyPhone: string
  issueDate: string
  dueDate: string
  status: "draft" | "sent" | "paid"
  items: InvoiceItem[]
  subtotal: number
  tax: number
  total: number
  notes: string
  createdAt: string
  emailLogs?: EmailLog[]
  lastEmailSent?: string
}
