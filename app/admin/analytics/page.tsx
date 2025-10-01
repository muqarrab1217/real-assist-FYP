"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { AdminLayout } from "@/components/layouts/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart } from "@/components/charts/line-chart"
import { BarChart } from "@/components/charts/bar-chart"
import { DoughnutChart } from "@/components/charts/doughnut-chart"

export default function AnalyticsPage() {
  // Lead Conversion Trend Data
  const leadConversionData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [
      {
        label: "Conversion Rate (%)",
        data: [28, 31, 29, 33, 35, 32, 36, 34, 37, 35, 38, 35],
        borderColor: "rgb(96, 165, 250)",
        backgroundColor: "rgba(96, 165, 250, 0.2)",
        tension: 0.4,
        fill: true,
      },
    ],
  }

  // Revenue Inflow Data
  const revenueData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [
      {
        label: "Revenue ($M)",
        data: [1.8, 2.1, 1.9, 2.3, 2.5, 2.2, 2.7, 2.4, 2.8, 2.6, 3.0, 2.4],
        backgroundColor: "rgba(74, 222, 128, 0.7)",
        borderColor: "rgb(74, 222, 128)",
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  }

  // Active Engagement Data
  const engagementData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [
      {
        label: "Active Users",
        data: [65, 72, 68, 78, 82, 75, 88, 85, 92, 87, 95, 90],
        borderColor: "rgb(45, 212, 191)",
        backgroundColor: "rgba(45, 212, 191, 0.2)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Interactions",
        data: [120, 145, 135, 165, 178, 155, 195, 182, 210, 198, 225, 205],
        borderColor: "rgb(251, 146, 60)",
        backgroundColor: "rgba(251, 146, 60, 0.2)",
        tension: 0.4,
        fill: true,
      },
    ],
  }

  // Project Status Distribution Data
  const projectStatusData = {
    labels: ["Completed", "In Progress", "Planning", "On Hold"],
    datasets: [
      {
        data: [45, 32, 15, 8],
        backgroundColor: [
          "rgba(74, 222, 128, 0.8)",
          "rgba(96, 165, 250, 0.8)",
          "rgba(251, 191, 36, 0.8)",
          "rgba(203, 213, 225, 0.8)",
        ],
        borderColor: ["rgb(74, 222, 128)", "rgb(96, 165, 250)", "rgb(251, 191, 36)", "rgb(203, 213, 225)"],
        borderWidth: 2,
      },
    ],
  }

  // Lead Source Distribution
  const leadSourceData = {
    labels: ["Website", "Referrals", "Social Media", "Direct", "Advertising"],
    datasets: [
      {
        label: "Leads",
        data: [85, 45, 62, 38, 55],
        backgroundColor: [
          "rgba(96, 165, 250, 0.7)",
          "rgba(45, 212, 191, 0.7)",
          "rgba(167, 139, 250, 0.7)",
          "rgba(251, 191, 36, 0.7)",
          "rgba(251, 146, 60, 0.7)",
        ],
        borderColor: [
          "rgb(96, 165, 250)",
          "rgb(45, 212, 191)",
          "rgb(167, 139, 250)",
          "rgb(251, 191, 36)",
          "rgb(251, 146, 60)",
        ],
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  }

  // Customer Satisfaction Data
  const satisfactionData = {
    labels: ["Very Satisfied", "Satisfied", "Neutral", "Unsatisfied"],
    datasets: [
      {
        data: [65, 25, 8, 2],
        backgroundColor: [
          "rgba(74, 222, 128, 0.8)",
          "rgba(96, 165, 250, 0.8)",
          "rgba(251, 191, 36, 0.8)",
          "rgba(248, 113, 113, 0.8)",
        ],
        borderColor: ["rgb(74, 222, 128)", "rgb(96, 165, 250)", "rgb(251, 191, 36)", "rgb(248, 113, 113)"],
        borderWidth: 2,
      },
    ],
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <AdminLayout>
        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Analytics & Reports</h2>
            <p className="text-muted-foreground">Interactive charts and insights into your business performance</p>
          </div>

          {/* Key Metrics Summary */}
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="border-l-4 border-l-blue-400">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Conversion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">35%</div>
                <p className="text-xs text-green-600 mt-1">+3% from last year</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-teal-400">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-teal-600">2.3h</div>
                <p className="text-xs text-green-600 mt-1">-0.5h improvement</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-400">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Customer Satisfaction</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">94%</div>
                <p className="text-xs text-green-600 mt-1">+2% from last quarter</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-amber-400">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-600">156</div>
                <p className="text-xs text-blue-600 mt-1">32 in progress</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>Lead Conversion Trend</CardTitle>
                <CardDescription>Monthly lead conversion rates over the past year</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <LineChart data={leadConversionData} />
              </CardContent>
            </Card>

            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>Revenue Inflow</CardTitle>
                <CardDescription>Monthly revenue trends and growth</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <BarChart data={revenueData} />
              </CardContent>
            </Card>

            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>Active Engagement</CardTitle>
                <CardDescription>Customer interaction and activity metrics</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <LineChart data={engagementData} />
              </CardContent>
            </Card>

            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>Project Status Distribution</CardTitle>
                <CardDescription>Overview of project completion stages</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <DoughnutChart data={projectStatusData} />
              </CardContent>
            </Card>

            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>Lead Source Distribution</CardTitle>
                <CardDescription>Where your leads are coming from</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <BarChart data={leadSourceData} />
              </CardContent>
            </Card>

            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>Customer Satisfaction</CardTitle>
                <CardDescription>Client satisfaction ratings breakdown</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <DoughnutChart data={satisfactionData} />
              </CardContent>
            </Card>
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  )
}
