"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { ClientLayout } from "@/components/layouts/client-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Building2, Calendar, CheckCircle2 } from "lucide-react"

const projects = [
  {
    id: "1",
    name: "Skyline Apartments",
    location: "Downtown District",
    status: "in-progress",
    progress: 75,
    completionDate: "June 2025",
    milestones: [
      { name: "Foundation", completed: true },
      { name: "Structure", completed: true },
      { name: "Interior Work", completed: true },
      { name: "Finishing", completed: false },
      { name: "Handover", completed: false },
    ],
    updates: [
      { date: "Jan 20, 2025", message: "Interior work 75% complete. On schedule for June delivery." },
      { date: "Jan 10, 2025", message: "Electrical and plumbing installations completed." },
      { date: "Dec 28, 2024", message: "Third floor interior work commenced." },
    ],
  },
  {
    id: "2",
    name: "Ocean View Villa",
    location: "Coastal Area",
    status: "in-progress",
    progress: 45,
    completionDate: "September 2025",
    milestones: [
      { name: "Foundation", completed: true },
      { name: "Structure", completed: true },
      { name: "Interior Work", completed: false },
      { name: "Finishing", completed: false },
      { name: "Handover", completed: false },
    ],
    updates: [
      { date: "Jan 18, 2025", message: "Structural work completed. Starting interior phase." },
      { date: "Jan 5, 2025", message: "Roof installation completed successfully." },
    ],
  },
]

export default function ProjectsPage() {
  return (
    <ProtectedRoute requiredRole="client">
      <ClientLayout>
        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Project Updates</h2>
            <p className="text-muted-foreground">Track progress and milestones for your properties</p>
          </div>

          {/* Projects List */}
          {projects.map((project, idx) => (
            <Card
              key={project.id}
              className={`bg-gradient-to-br ${idx === 0 ? "from-blue-50/50 to-teal-50/30" : "from-green-50/50 to-blue-50/30"}`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Building2 className={`h-6 w-6 mt-1 ${idx === 0 ? "text-blue-600" : "text-green-600"}`} />
                    <div>
                      <CardTitle className={`text-xl ${idx === 0 ? "text-blue-900" : "text-green-900"}`}>
                        {project.name}
                      </CardTitle>
                      <CardDescription>{project.location}</CardDescription>
                    </div>
                  </div>
                  <Badge
                    variant={project.status === "in-progress" ? "default" : "secondary"}
                    className={project.status === "in-progress" ? "bg-blue-600" : "bg-green-600"}
                  >
                    {project.status === "in-progress" ? "In Progress" : "Completed"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Overall Progress</span>
                    <span className={`font-semibold ${idx === 0 ? "text-blue-700" : "text-green-700"}`}>
                      {project.progress}%
                    </span>
                  </div>
                  <Progress
                    value={project.progress}
                    className={`h-2 ${idx === 0 ? "[&>div]:bg-blue-600" : "[&>div]:bg-green-600"}`}
                  />
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Expected Completion: {project.completionDate}
                  </div>
                </div>

                {/* Milestones */}
                <div>
                  <h4 className="font-semibold mb-3">Milestones</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {project.milestones.map((milestone, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border ${
                          milestone.completed
                            ? idx === 0
                              ? "bg-blue-50 border-blue-200"
                              : "bg-green-50 border-green-200"
                            : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle2
                            className={`h-4 w-4 ${
                              milestone.completed ? (idx === 0 ? "text-blue-600" : "text-green-600") : "text-gray-400"
                            }`}
                          />
                          <span className="text-sm font-medium">{milestone.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Updates */}
                <div>
                  <h4 className="font-semibold mb-3">Recent Announcements</h4>
                  <div className="space-y-3">
                    {project.updates.map((update, index) => (
                      <div key={index} className="flex gap-3 pb-3 border-b last:border-0">
                        <div
                          className={`h-2 w-2 rounded-full mt-2 flex-shrink-0 ${idx === 0 ? "bg-blue-600" : "bg-green-600"}`}
                        />
                        <div className="flex-1">
                          <p className="text-sm">{update.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">{update.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ClientLayout>
    </ProtectedRoute>
  )
}
