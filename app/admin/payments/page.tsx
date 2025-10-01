"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { AdminLayout } from "@/components/layouts/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

const recentTransactions = [
  {
    id: "1",
    date: "Jan 20, 2025",
    customer: "John Doe",
    project: "Skyline Apartments",
    amount: 15000,
    status: "completed",
  },
  {
    id: "2",
    date: "Jan 18, 2025",
    customer: "Jane Smith",
    project: "Ocean View Villa",
    amount: 25000,
    status: "completed",
  },
  {
    id: "3",
    date: "Jan 15, 2025",
    customer: "Alex Johnson",
    project: "Downtown Lofts",
    amount: 30000,
    status: "completed",
  },
  {
    id: "4",
    date: "Jan 12, 2025",
    customer: "Maria Garcia",
    project: "Suburban Homes",
    amount: 20000,
    status: "pending",
  },
  {
    id: "5",
    date: "Jan 10, 2025",
    customer: "Robert Wilson",
    project: "City Center",
    amount: 18000,
    status: "completed",
  },
]

export default function AdminPaymentsPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminLayout>
        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Payments & Ledger</h2>
            <p className="text-muted-foreground">Track all transactions and financial records</p>
          </div>

          {/* Financial Overview */}
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="border-l-4 border-l-green-400 bg-green-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-green-900">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-700">$45.2M</div>
                <p className="text-xs text-green-600 mt-1">All time</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-teal-400 bg-teal-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-teal-900">This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-teal-700">$2.4M</div>
                <p className="text-xs text-teal-600 mt-1">+18% from last month</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-amber-400 bg-amber-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-amber-900">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-700">$1.2M</div>
                <p className="text-xs text-amber-600 mt-1">Awaiting payment</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-400 bg-red-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-red-900">Outstanding</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-700">$850K</div>
                <p className="text-xs text-red-600 mt-1">Overdue payments</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Transactions */}
          <Card className="bg-gradient-to-br from-green-50/20 to-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-green-900">Recent Transactions</CardTitle>
                  <CardDescription>Latest payment activities across all customers</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-green-200 text-green-700 hover:bg-green-50 bg-transparent"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export Ledger
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{transaction.date}</TableCell>
                      <TableCell className="font-medium">{transaction.customer}</TableCell>
                      <TableCell>{transaction.project}</TableCell>
                      <TableCell className="font-semibold text-green-700">
                        ${transaction.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge className={transaction.status === "completed" ? "bg-green-600" : "bg-amber-500"}>
                          {transaction.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  )
}
