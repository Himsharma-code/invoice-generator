import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { InvoiceEmailTemplate } from "@/components/invoice-email-template"
import type { Invoice } from "@/types/invoice"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { invoice, customMessage } = (await request.json()) as {
      invoice: Invoice
      customMessage?: string
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: "Email service not configured. Please add RESEND_API_KEY to environment variables." },
        { status: 500 },
      )
    }

    const { data, error } = await resend.emails.send({
      from: `${invoice.companyName} <invoices@yourdomain.com>`,
      to: [invoice.clientEmail],
      subject: `Invoice ${invoice.invoiceNumber} from ${invoice.companyName}`,
      react: InvoiceEmailTemplate({
        invoice,
        customMessage:
          customMessage ||
          `Please find attached your invoice ${invoice.invoiceNumber}. Payment is due by ${new Date(invoice.dueDate).toLocaleDateString()}.`,
      }),
    })

    if (error) {
      console.error("Email sending error:", error)
      return NextResponse.json({ error: "Failed to send email", details: error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      emailId: data?.id,
      message: "Invoice sent successfully!",
    })
  } catch (error) {
    console.error("Email API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
