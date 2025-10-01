"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { ClientLayout } from "@/components/layouts/client-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, FileText } from "lucide-react"

const ledgerEntries = [
  { id: "1", date: "Jan 15, 2025", description: "Installment Payment #5", debit: 15000, credit: 0, balance: 435000 },
  { id: "2", date: "Dec 15, 2024", description: "Installment Payment #4", debit: 15000, credit: 0, balance: 420000 },
  { id: "3", date: "Nov 15, 2024", description: "Installment Payment #3", debit: 15000, credit: 0, balance: 405000 },
  { id: "4", date: "Nov 1, 2024", description: "Ocean View Villa - Initial", debit: 50000, credit: 0, balance: 390000 },
  { id: "5", date: "Oct 15, 2024", description: "Installment Payment #2", debit: 15000, credit: 0, balance: 340000 },
]

export default function LedgerPage() {
  const handleDownload = (format: "pdf" | "excel") => {
    alert(`Downloading ledger as ${format.toUpperCase()}...`)
  }

  return (
    <ProtectedRoute requiredRole="client">
      <ClientLayout>
        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Financial Ledger</h2>
            <p className="text-muted-foreground">Auto-updated financial records for all your transactions</p>
          </div>

          {/* Summary Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-l-4 border-l-green-400 bg-green-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-green-900">Total Paid</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-700">$450,000</div>
                <p className="text-xs text-green-600 mt-1">Lifetime payments</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-amber-400 bg-amber-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-amber-900">Outstanding Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-700">$25,000</div>
                <p className="text-xs text-amber-600 mt-1">Remaining amount</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-400 bg-blue-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-900">Next Payment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-700">Feb 15</div>
                <p className="text-xs text-blue-600 mt-1">Due in 15 days</p>
              </CardContent>
            </Card>
          </div>

          {/* Ledger Table */}
          <Card className="bg-gradient-to-br from-teal-50/30 to-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-teal-900">Transaction Ledger</CardTitle>
                  <CardDescription>Complete record of all financial transactions</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload("pdf")}
                    className="border-teal-200 text-teal-700 hover:bg-teal-50"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    PDF
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload("excel")}
                    className="border-teal-200 text-teal-700 hover:bg-teal-50"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Excel
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Debit</TableHead>
                    <TableHead className="text-right">Credit</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ledgerEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{entry.date}</TableCell>
                      <TableCell className="font-medium">{entry.description}</TableCell>
                      <TableCell className="text-right text-green-700">${entry.debit.toLocaleString()}</TableCell>
                      <TableCell className="text-right">${entry.credit.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-semibold text-teal-700">
                        ${entry.balance.toLocaleString()}
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
