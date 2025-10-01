"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { AdminLayout } from "@/components/layouts/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Filter, Eye } from "lucide-react"
import { useState } from "react"

const customers = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@email.com",
    phone: "+1 234-567-8901",
    projects: 2,
    totalInvestment: 450000,
    status: "active",
    joinDate: "Nov 2024",
    lastInteraction: "2 days ago",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@email.com",
    phone: "+1 234-567-8902",
    projects: 1,
    totalInvestment: 320000,
    status: "active",
    joinDate: "Dec 2024",
    lastInteraction: "1 week ago",
  },
  {
    id: "3",
    name: "Alex Johnson",
    email: "alex.j@email.com",
    phone: "+1 234-567-8903",
    projects: 3,
    totalInvestment: 780000,
    status: "active",
    joinDate: "Oct 2024",
    lastInteraction: "3 days ago",
  },
  {
    id: "4",
    name: "Maria Garcia",
    email: "maria.g@email.com",
    phone: "+1 234-567-8904",
    projects: 1,
    totalInvestment: 250000,
    status: "inactive",
    joinDate: "Sep 2024",
    lastInteraction: "1 month ago",
  },
]

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState("")

  return (
    <ProtectedRoute requiredRole="admin">
      <AdminLayout>
        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Customer Management</h2>
            <p className="text-muted-foreground">View and manage client profiles and interactions</p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="border-l-4 border-l-teal-400 bg-teal-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-teal-900">Total Customers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-teal-700">87</div>
                <p className="text-xs text-teal-600 mt-1">+5 this month</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-400 bg-blue-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-900">Active Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-700">156</div>
                <p className="text-xs text-blue-600 mt-1">Across all customers</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-400 bg-green-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-green-900">Avg. Investment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-700">$518K</div>
                <p className="text-xs text-green-600 mt-1">Per customer</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-amber-400 bg-amber-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-amber-900">Retention Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-700">94%</div>
                <p className="text-xs text-amber-600 mt-1">Last 12 months</p>
              </CardContent>
            </Card>
          </div>

          {/* Customers Table */}
          <Card className="bg-gradient-to-br from-teal-50/20 to-white">
            <CardHeader>
              <CardTitle className="text-teal-900">All Customers</CardTitle>
              <CardDescription>Complete list of registered clients</CardDescription>
              <div className="flex items-center gap-4 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search customers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-teal-200 text-teal-700 hover:bg-teal-50 bg-transparent"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Projects</TableHead>
                    <TableHead>Investment</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead>Last Interaction</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{customer.email}</div>
                          <div className="text-muted-foreground">{customer.phone}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-blue-700 font-medium">{customer.projects}</TableCell>
                      <TableCell className="font-semibold text-green-700">
                        ${customer.totalInvestment.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{customer.joinDate}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{customer.lastInteraction}</TableCell>
                      <TableCell>
                        <Badge className={customer.status === "active" ? "bg-green-600" : "bg-gray-500"}>
                          {customer.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-teal-600 hover:text-teal-700 hover:bg-teal-50"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
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
