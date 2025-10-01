"use client"

import { useState } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { ClientLayout } from "@/components/layouts/client-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Download } from "lucide-react"

const paymentHistory = [
  {
    id: "1",
    date: "Jan 15, 2025",
    project: "Skyline Apartments",
    amount: 15000,
    status: "completed",
    type: "Installment #5",
  },
  {
    id: "2",
    date: "Dec 15, 2024",
    project: "Skyline Apartments",
    amount: 15000,
    status: "completed",
    type: "Installment #4",
  },
  {
    id: "3",
    date: "Nov 15, 2024",
    project: "Skyline Apartments",
    amount: 15000,
    status: "completed",
    type: "Installment #3",
  },
  {
    id: "4",
    date: "Nov 1, 2024",
    project: "Ocean View Villa",
    amount: 50000,
    status: "completed",
    type: "Initial Payment",
  },
  {
    id: "5",
    date: "Feb 15, 2025",
    project: "Skyline Apartments",
    amount: 25000,
    status: "pending",
    type: "Installment #6",
  },
]

export default function PaymentsPage() {
  const [isProcessing, setIsProcessing] = useState(false)

  const handlePayment = async () => {
    setIsProcessing(true)
    // Mock payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsProcessing(false)
    alert("Payment processed successfully!")
  }

  return (
    <ProtectedRoute requiredRole="client">
      <ClientLayout>
        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Payments</h2>
            <p className="text-muted-foreground">Manage your installments and payment history</p>
          </div>

          {/* Pending Payment Card */}
          <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
            <CardHeader>
              <CardTitle className="text-amber-900">Upcoming Payment</CardTitle>
              <CardDescription className="text-amber-700">Your next installment is due soon</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-amber-900">$25,000</p>
                  <p className="text-sm text-amber-700">Skyline Apartments - Installment #6</p>
                  <p className="text-sm text-amber-600">Due: February 15, 2025</p>
                </div>
                <Button
                  size="lg"
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  {isProcessing ? "Processing..." : "Pay Now"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Payment History */}
          <Card className="bg-gradient-to-br from-blue-50/30 to-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-blue-900">Payment History</CardTitle>
                  <CardDescription>View all your past transactions</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentHistory.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{payment.date}</TableCell>
                      <TableCell className="font-medium">{payment.project}</TableCell>
                      <TableCell>{payment.type}</TableCell>
                      <TableCell className="font-semibold text-teal-700">${payment.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge
                          variant={payment.status === "completed" ? "default" : "secondary"}
                          className={payment.status === "completed" ? "bg-green-600" : "bg-amber-500"}
                        >
                          {payment.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </ClientLayout>
    </ProtectedRoute>
  )
}
