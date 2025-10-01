"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { AdminLayout } from "@/components/layouts/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, TrendingUp, DollarSign, UserCheck, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function AdminDashboard() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminLayout>
        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Admin Dashboard</h2>
            <p className="text-muted-foreground">Overview of your real estate operations</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <Card className="border-l-4 border-l-blue-400 bg-blue-50/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-blue-900">Total Leads</CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-700">248</div>
                <p className="text-xs text-blue-600 mt-1">+12% from last month</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-teal-400 bg-teal-50/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-teal-900">Active Clients</CardTitle>
                <UserCheck className="h-4 w-4 text-teal-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-teal-700">87</div>
                <p className="text-xs text-teal-600 mt-1">+5 new this month</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-400 bg-green-50/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-green-900">Revenue (MTD)</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-700">$2.4M</div>
                <p className="text-xs text-green-600 mt-1">+18% from last month</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-amber-400 bg-amber-50/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-amber-900">Conversion Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-amber-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-700">35%</div>
                <p className="text-xs text-amber-600 mt-1">+3% from last month</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="hover:border-blue-300 transition-colors cursor-pointer bg-gradient-to-br from-blue-50/30 to-white">
              <Link href="/admin/leads">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-blue-900">
                    Lead Management
                    <ArrowRight className="h-5 w-5 text-blue-600" />
                  </CardTitle>
                  <CardDescription>Manage and classify your leads</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-red-600">Hot Leads: 45</p>
                      <p className="text-sm text-blue-600">Cold Leads: 128</p>
                      <p className="text-sm text-gray-600">Dead Leads: 75</p>
                    </div>
                  </div>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:border-teal-300 transition-colors cursor-pointer bg-gradient-to-br from-teal-50/30 to-white">
              <Link href="/admin/customers">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-teal-900">
                    Customer Management
                    <ArrowRight className="h-5 w-5 text-teal-600" />
                  </CardTitle>
                  <CardDescription>View client profiles and interactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-teal-700">Total Customers: 87</p>
                    <p className="text-sm text-teal-600">Active Projects: 156</p>
                    <p className="text-sm text-teal-600">Avg. Investment: $518K</p>
                  </div>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:border-green-300 transition-colors cursor-pointer bg-gradient-to-br from-green-50/30 to-white">
              <Link href="/admin/payments">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-green-900">
                    Payments & Ledger
                    <ArrowRight className="h-5 w-5 text-green-600" />
                  </CardTitle>
                  <CardDescription>Track transactions and financial records</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-amber-700">Pending: $1.2M</p>
                    <p className="text-sm text-green-600">Collected (MTD): $2.4M</p>
                    <p className="text-sm text-green-600">Outstanding: $850K</p>
                  </div>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:border-amber-300 transition-colors cursor-pointer bg-gradient-to-br from-amber-50/30 to-white">
              <Link href="/admin/analytics">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-amber-900">
                    Analytics & Reports
                    <ArrowRight className="h-5 w-5 text-amber-600" />
                  </CardTitle>
                  <CardDescription>View insights and generate reports</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-amber-700">Lead Conversion: 35%</p>
                    <p className="text-sm text-amber-600">Avg. Response Time: 2.3h</p>
                    <p className="text-sm text-amber-600">Customer Satisfaction: 94%</p>
                  </div>
                </CardContent>
              </Link>
            </Card>
          </div>

          <Card className="bg-gradient-to-br from-blue-50/20 to-white">
            <CardHeader>
              <CardTitle className="text-blue-900">Recent Activity</CardTitle>
              <CardDescription>Latest updates across the platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-blue-100">
                <div>
                  <p className="font-medium">New lead assigned</p>
                  <p className="text-sm text-muted-foreground">
                    Sarah Johnson - <span className="text-red-600 font-medium">Hot Lead</span>
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">5 min ago</p>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-blue-100">
                <div>
                  <p className="font-medium">Payment received</p>
                  <p className="text-sm text-muted-foreground">
                    John Doe - <span className="text-green-600 font-medium">$25,000</span>
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">1 hour ago</p>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-blue-100">
                <div>
                  <p className="font-medium">Project milestone reached</p>
                  <p className="text-sm text-muted-foreground">
                    Skyline Apartments - <span className="text-blue-600 font-medium">75% complete</span>
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">3 hours ago</p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">New customer registered</p>
                  <p className="text-sm text-muted-foreground">Michael Chen</p>
                </div>
                <p className="text-xs text-muted-foreground">5 hours ago</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  )
}
