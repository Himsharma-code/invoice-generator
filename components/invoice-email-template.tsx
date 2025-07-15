import type { Invoice } from "@/types/invoice"

interface InvoiceEmailTemplateProps {
  invoice: Invoice
  customMessage?: string
}

export function InvoiceEmailTemplate({ invoice, customMessage }: InvoiceEmailTemplateProps) {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", maxWidth: "600px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ backgroundColor: "#f8f9fa", padding: "20px", textAlign: "center" }}>
        <h1 style={{ color: "#333", margin: "0", fontSize: "24px" }}>{invoice.companyName}</h1>
        <p style={{ color: "#666", margin: "5px 0 0 0" }}>Invoice #{invoice.invoiceNumber}</p>
      </div>

      {/* Content */}
      <div style={{ padding: "30px 20px" }}>
        <p style={{ fontSize: "16px", lineHeight: "1.5", color: "#333" }}>Dear {invoice.clientName},</p>

        <p style={{ fontSize: "16px", lineHeight: "1.5", color: "#333" }}>{customMessage}</p>

        {/* Invoice Summary */}
        <div
          style={{
            backgroundColor: "#f8f9fa",
            padding: "20px",
            borderRadius: "8px",
            margin: "20px 0",
          }}
        >
          <h3 style={{ margin: "0 0 15px 0", color: "#333" }}>Invoice Summary</h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tr>
              <td style={{ padding: "5px 0", color: "#666" }}>Invoice Number:</td>
              <td style={{ padding: "5px 0", fontWeight: "bold", textAlign: "right" }}>{invoice.invoiceNumber}</td>
            </tr>
            <tr>
              <td style={{ padding: "5px 0", color: "#666" }}>Issue Date:</td>
              <td style={{ padding: "5px 0", textAlign: "right" }}>
                {new Date(invoice.issueDate).toLocaleDateString()}
              </td>
            </tr>
            <tr>
              <td style={{ padding: "5px 0", color: "#666" }}>Due Date:</td>
              <td style={{ padding: "5px 0", textAlign: "right", fontWeight: "bold" }}>
                {new Date(invoice.dueDate).toLocaleDateString()}
              </td>
            </tr>
            <tr style={{ borderTop: "2px solid #ddd" }}>
              <td style={{ padding: "10px 0 5px 0", fontSize: "18px", fontWeight: "bold" }}>Total Amount:</td>
              <td
                style={{
                  padding: "10px 0 5px 0",
                  fontSize: "18px",
                  fontWeight: "bold",
                  textAlign: "right",
                  color: "#2563eb",
                }}
              >
                ${invoice.total.toFixed(2)}
              </td>
            </tr>
          </table>
        </div>

        {/* Items */}
        <h3 style={{ color: "#333", marginBottom: "15px" }}>Invoice Items</h3>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            border: "1px solid #ddd",
            marginBottom: "20px",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f8f9fa" }}>
              <th
                style={{
                  padding: "12px",
                  textAlign: "left",
                  borderBottom: "1px solid #ddd",
                  color: "#333",
                }}
              >
                Description
              </th>
              <th
                style={{
                  padding: "12px",
                  textAlign: "center",
                  borderBottom: "1px solid #ddd",
                  color: "#333",
                }}
              >
                Qty
              </th>
              <th
                style={{
                  padding: "12px",
                  textAlign: "right",
                  borderBottom: "1px solid #ddd",
                  color: "#333",
                }}
              >
                Rate
              </th>
              <th
                style={{
                  padding: "12px",
                  textAlign: "right",
                  borderBottom: "1px solid #ddd",
                  color: "#333",
                }}
              >
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr key={index}>
                <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>{item.description}</td>
                <td style={{ padding: "12px", textAlign: "center", borderBottom: "1px solid #eee" }}>
                  {item.quantity}
                </td>
                <td style={{ padding: "12px", textAlign: "right", borderBottom: "1px solid #eee" }}>
                  ${item.rate.toFixed(2)}
                </td>
                <td style={{ padding: "12px", textAlign: "right", borderBottom: "1px solid #eee" }}>
                  ${item.amount.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Payment Instructions */}
        <div
          style={{
            backgroundColor: "#e7f3ff",
            padding: "20px",
            borderRadius: "8px",
            border: "1px solid #b3d9ff",
          }}
        >
          <h3 style={{ margin: "0 0 10px 0", color: "#1e40af" }}>Payment Instructions</h3>
          <p style={{ margin: "0", color: "#1e40af", lineHeight: "1.5" }}>
            Please remit payment by the due date. If you have any questions about this invoice, please contact us at{" "}
            {invoice.companyEmail} or {invoice.companyPhone}.
          </p>
        </div>

        <p style={{ fontSize: "16px", lineHeight: "1.5", color: "#333", marginTop: "20px" }}>
          Thank you for your business!
        </p>

        <p style={{ fontSize: "16px", lineHeight: "1.5", color: "#333" }}>
          Best regards,
          <br />
          {invoice.companyName}
        </p>
      </div>

      {/* Footer */}
      <div
        style={{
          backgroundColor: "#f8f9fa",
          padding: "20px",
          textAlign: "center",
          borderTop: "1px solid #ddd",
        }}
      >
        <p style={{ margin: "0", fontSize: "14px", color: "#666" }}>{invoice.companyAddress}</p>
        <p style={{ margin: "5px 0 0 0", fontSize: "14px", color: "#666" }}>
          {invoice.companyEmail} | {invoice.companyPhone}
        </p>
      </div>
    </div>
  )
}
