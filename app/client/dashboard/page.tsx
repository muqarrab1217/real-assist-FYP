"use client"

import { useState } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { ClientLayout } from "@/components/layouts/client-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, DollarSign, FileText, Bell, ArrowRight, MessageSquare } from "lucide-react"
import Link from "next/link"
import { AIChatWidget } from "@/components/ai-chat-widget"

export default function ClientDashboard() {
  const [isChatOpen, setIsChatOpen] = useState(false)

  return (
    <ProtectedRoute requiredRole="client">
      <ClientLayout>
        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Welcome Back!</h2>
            <p className="text-muted-foreground">Here's an overview of your real estate portfolio</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-l-4 border-l-blue-400 bg-blue-50/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-blue-900">Active Projects</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-700">3</div>
                <p className="text-xs text-blue-600 mt-1">2 in progress, 1 completed</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-teal-400 bg-teal-50/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-teal-900">Total Invested</CardTitle>
                <DollarSign className="h-4 w-4 text-teal-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-teal-700">$450,000</div>
                <p className="text-xs text-teal-600 mt-1">Across all properties</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-amber-400 bg-amber-50/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-amber-900">Pending Payments</CardTitle>
                <FileText className="h-4 w-4 text-amber-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-700">$25,000</div>
                <p className="text-xs text-amber-600 mt-1">Due in 15 days</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-blue-50/30 to-white">
              <CardHeader>
                <CardTitle className="text-blue-900">Recent Payments</CardTitle>
                <CardDescription>Your latest payment transactions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-blue-100">
                  <div>
                    <p className="font-medium">Installment #5</p>
                    <p className="text-sm text-muted-foreground">Skyline Apartments</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-teal-700">$15,000</p>
                    <p className="text-xs text-muted-foreground">Jan 15, 2025</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pb-3 border-b border-blue-100">
                  <div>
                    <p className="font-medium">Installment #4</p>
                    <p className="text-sm text-muted-foreground">Skyline Apartments</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-teal-700">$15,000</p>
                    <p className="text-xs text-muted-foreground">Dec 15, 2024</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Initial Payment</p>
                    <p className="text-sm text-muted-foreground">Ocean View Villa</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-teal-700">$50,000</p>
                    <p className="text-xs text-muted-foreground">Nov 1, 2024</p>
                  </div>
                </div>
                <Link href="/client/payments">
                  <Button
                    variant="outline"
                    className="w-full mt-4 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                  >
                    View All Payments
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50/30 to-white">
              <CardHeader>
                <CardTitle className="text-green-900">Project Updates</CardTitle>
                <CardDescription>Latest progress on your properties</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3 pb-3 border-b border-green-100">
                  <Bell className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">Construction Milestone Reached</p>
                    <p className="text-sm text-muted-foreground">Skyline Apartments - 75% complete</p>
                    <p className="text-xs text-muted-foreground mt-1">2 days ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 pb-3 border-b border-green-100">
                  <Bell className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">Payment Reminder</p>
                    <p className="text-sm text-muted-foreground">Next installment due in 15 days</p>
                    <p className="text-xs text-muted-foreground mt-1">5 days ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Bell className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">New Document Available</p>
                    <p className="text-sm text-muted-foreground">Updated floor plans uploaded</p>
                    <p className="text-xs text-muted-foreground mt-1">1 week ago</p>
                  </div>
                </div>
                <Link href="/client/projects">
                  <Button
                    variant="outline"
                    className="w-full mt-4 bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                  >
                    View All Updates
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gradient-to-r from-blue-600 to-teal-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">Need Assistance?</h3>
                  <p className="text-white/90">Chat with our AI assistant for instant support</p>
                </div>
                <Button
                  variant="secondary"
                  size="lg"
                  className="bg-white text-blue-700 hover:bg-blue-50"
                  onClick={() => setIsChatOpen(true)}
                >
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Start Chat
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <AIChatWidget
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          onMinimize={() => setIsChatOpen(false)}
        />
      </ClientLayout>
    </ProtectedRoute>
  )
}
