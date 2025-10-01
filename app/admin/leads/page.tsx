"use client"

import { useState } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { AdminLayout } from "@/components/layouts/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Filter } from "lucide-react"

const leadsData = {
  hot: [
    {
      id: "1",
      name: "Sarah Johnson",
      email: "sarah.j@email.com",
      phone: "+1 234-567-8901",
      interest: "Skyline Apartments",
      score: 95,
      lastContact: "2 hours ago",
    },
    {
      id: "2",
      name: "Michael Chen",
      email: "m.chen@email.com",
      phone: "+1 234-567-8902",
      interest: "Ocean View Villa",
      score: 92,
      lastContact: "5 hours ago",
    },
    {
      id: "3",
      name: "Emily Davis",
      email: "emily.d@email.com",
      phone: "+1 234-567-8903",
      interest: "Downtown Lofts",
      score: 88,
      lastContact: "1 day ago",
    },
  ],
  cold: [
    {
      id: "4",
      name: "Robert Wilson",
      email: "r.wilson@email.com",
      phone: "+1 234-567-8904",
      interest: "Suburban Homes",
      score: 45,
      lastContact: "1 week ago",
    },
    {
      id: "5",
      name: "Lisa Anderson",
      email: "lisa.a@email.com",
      phone: "+1 234-567-8905",
      interest: "City Center",
      score: 42,
      lastContact: "2 weeks ago",
    },
    {
      id: "6",
      name: "David Brown",
      email: "d.brown@email.com",
      phone: "+1 234-567-8906",
      interest: "Lakeside Villas",
      score: 38,
      lastContact: "3 weeks ago",
    },
  ],
  dead: [
    {
      id: "7",
      name: "Jennifer Lee",
      email: "j.lee@email.com",
      phone: "+1 234-567-8907",
      interest: "Mountain View",
      score: 15,
      lastContact: "2 months ago",
    },
    {
      id: "8",
      name: "Thomas White",
      email: "t.white@email.com",
      phone: "+1 234-567-8908",
      interest: "Beach House",
      score: 12,
      lastContact: "3 months ago",
    },
  ],
}

export default function LeadsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("hot")

  return (
    <ProtectedRoute requiredRole="admin">
      <AdminLayout>
        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Lead Management</h2>
            <p className="text-muted-foreground">AI-classified leads based on engagement and interest</p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-l-4 border-l-red-400 bg-red-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-red-900">Hot Leads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">45</div>
                <p className="text-xs text-red-600 mt-1">High engagement, ready to convert</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-400 bg-blue-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-900">Cold Leads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">128</div>
                <p className="text-xs text-blue-600 mt-1">Low engagement, needs nurturing</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-gray-400 bg-gray-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-900">Dead Leads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-600">75</div>
                <p className="text-xs text-gray-600 mt-1">No response, inactive</p>
              </CardContent>
            </Card>
          </div>

          {/* Leads Table */}
          <Card className="bg-gradient-to-br from-blue-50/20 to-white">
            <CardHeader>
              <CardTitle className="text-blue-900">All Leads</CardTitle>
              <CardDescription>View and manage leads by classification</CardDescription>
              <div className="flex items-center gap-4 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search leads..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="hot">Hot ({leadsData.hot.length})</TabsTrigger>
                  <TabsTrigger value="cold">Cold ({leadsData.cold.length})</TabsTrigger>
                  <TabsTrigger value="dead">Dead ({leadsData.dead.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="hot" className="mt-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Interest</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Last Contact</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leadsData.hot.map((lead) => (
                        <TableRow key={lead.id}>
                          <TableCell className="font-medium">{lead.name}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{lead.email}</div>
                              <div className="text-muted-foreground">{lead.phone}</div>
                            </div>
                          </TableCell>
                          <TableCell>{lead.interest}</TableCell>
                          <TableCell>
                            <Badge className="bg-red-500 hover:bg-red-600">{lead.score}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{lead.lastContact}</TableCell>
                          <TableCell>
                            <Badge className="bg-red-600">Hot</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>

                <TabsContent value="cold" className="mt-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Interest</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Last Contact</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leadsData.cold.map((lead) => (
                        <TableRow key={lead.id}>
                          <TableCell className="font-medium">{lead.name}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{lead.email}</div>
                              <div className="text-muted-foreground">{lead.phone}</div>
                            </div>
                          </TableCell>
                          <TableCell>{lead.interest}</TableCell>
                          <TableCell>
                            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">{lead.score}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{lead.lastContact}</TableCell>
                          <TableCell>
                            <Badge className="bg-blue-600">Cold</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>

                <TabsContent value="dead" className="mt-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Interest</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Last Contact</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leadsData.dead.map((lead) => (
                        <TableRow key={lead.id}>
                          <TableCell className="font-medium">{lead.name}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{lead.email}</div>
                              <div className="text-muted-foreground">{lead.phone}</div>
                            </div>
                          </TableCell>
                          <TableCell>{lead.interest}</TableCell>
                          <TableCell>
                            <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-200">{lead.score}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{lead.lastContact}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="border-gray-400 text-gray-600">
                              Dead
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  )
}
