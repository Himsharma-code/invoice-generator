"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, CheckCircle, XCircle, Clock } from "lucide-react"
import type { EmailLog } from "@/types/invoice"

interface EmailHistoryProps {
  emailLogs: EmailLog[]
}

export function EmailHistory({ emailLogs }: EmailHistoryProps) {
  if (!emailLogs || emailLogs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Email History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-4">No emails sent yet</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Email History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {emailLogs.map((log) => (
            <div key={log.id} className="flex items-start gap-3 p-3 border rounded-lg">
              <div className="mt-1">
                {log.status === "sent" ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{log.subject}</span>
                  <Badge variant={log.status === "sent" ? "default" : "destructive"}>{log.status}</Badge>
                </div>
                <p className="text-sm text-gray-600">To: {log.recipient}</p>
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                  <Clock className="w-3 h-3" />
                  {new Date(log.sentAt).toLocaleString()}
                </div>
                {log.error && <p className="text-xs text-red-600 mt-1">Error: {log.error}</p>}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
