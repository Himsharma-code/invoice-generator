"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useInvoices } from "@/contexts/invoice-context"
import { TrendingUp, TrendingDown, DollarSign, FileText, Clock, CheckCircle } from "lucide-react"

export function Analytics() {
  const { invoices } = useInvoices()

  // Calculate analytics
  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0)
  const paidRevenue = invoices.filter((inv) => inv.status === "paid").reduce((sum, inv) => sum + inv.total, 0)
  const pendingRevenue = invoices.filter((inv) => inv.status === "sent").reduce((sum, inv) => sum + inv.total, 0)
  const overdueRevenue = invoices.filter((inv) => inv.status === "overdue").reduce((sum, inv) => sum + inv.total, 0)

  const statusCounts = {
    total: invoices.length,
    paid: invoices.filter((inv) => inv.status === "paid").length,
    sent: invoices.filter((inv) => inv.status === "sent").length,
    draft: invoices.filter((inv) => inv.status === "draft").length,
    overdue: invoices.filter((inv) => inv.status === "overdue").length,
  }

  // Monthly trends (last 6 months)
  const monthlyData = []
  for (let i = 5; i >= 0; i--) {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

    const monthInvoices = invoices.filter((inv) => {
      const invDate = new Date(inv.createdAt)
      const invMonthKey = `${invDate.getFullYear()}-${String(invDate.getMonth() + 1).padStart(2, "0")}`
      return invMonthKey === monthKey
    })

    monthlyData.push({
      month: date.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      count: monthInvoices.length,
      revenue: monthInvoices.reduce((sum, inv) => sum + inv.total, 0),
    })
  }

  // Average invoice value
  const avgInvoiceValue = invoices.length > 0 ? totalRevenue / invoices.length : 0

  // Payment rate
  const paymentRate = invoices.length > 0 ? (statusCounts.paid / invoices.length) * 100 : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Analytics Dashboard</h1>
        <p className="text-gray-600">Overview of your invoice performance</p>
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Paid Revenue</p>
                <p className="text-2xl font-bold">${paidRevenue.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Revenue</p>
                <p className="text-2xl font-bold">${pendingRevenue.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingDown className="w-8 h-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Overdue Revenue</p>
                <p className="text-2xl font-bold">${overdueRevenue.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Invoice Value</p>
                <p className="text-2xl font-bold">${avgInvoiceValue.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Payment Rate</p>
                <p className="text-2xl font-bold">{paymentRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Invoices</p>
                <p className="text-2xl font-bold">{statusCounts.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Status Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{statusCounts.paid}</div>
              <div className="text-sm text-green-700">Paid</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{statusCounts.sent}</div>
              <div className="text-sm text-blue-700">Sent</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">{statusCounts.draft}</div>
              <div className="text-sm text-gray-700">Draft</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{statusCounts.overdue}</div>
              <div className="text-sm text-red-700">Overdue</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monthlyData.map((month, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">{month.month}</div>
                  <div className="text-sm text-gray-600">{month.count} invoices</div>
                </div>
                <div className="text-right">
                  <div className="font-bold">${month.revenue.toFixed(2)}</div>
                  <div className="text-sm text-gray-600">Revenue</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
