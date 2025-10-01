"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Building2, LayoutDashboard, CreditCard, FileText, TrendingUp, LogOut, MessageSquare } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [isHovered, setIsHovered] = useState(false)

  const navItems = [
    { href: "/client/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/client/payments", label: "Payments", icon: CreditCard },
    { href: "/client/ledger", label: "Ledger", icon: FileText },
    { href: "/client/projects", label: "Project Updates", icon: TrendingUp },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-teal-50/30">
      <aside
        className={cn(
          "fixed left-0 top-0 h-full bg-gray-50 border-r border-gray-200 shadow-lg transition-all duration-300 ease-in-out z-50",
          isHovered ? "w-64" : "w-20",
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="p-6 border-b border-gray-200">
          <Link href="/" className="flex items-center gap-2">
            <Building2 className="h-8 w-8 text-blue-600 flex-shrink-0" />
            <span
              className={cn(
                "text-xl font-bold text-gray-900 transition-all duration-300",
                isHovered ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden",
              )}
            >
              RealAssist
            </span>
          </Link>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200",
                    isActive && "bg-blue-50 text-blue-700 border-l-4 border-blue-500",
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span
                    className={cn(
                      "ml-3 transition-all duration-300",
                      isHovered ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden",
                    )}
                  >
                    {item.label}
                  </span>
                </Button>
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div
            className={cn(
              "mb-3 px-2 transition-all duration-300",
              isHovered ? "opacity-100" : "opacity-0 h-0 overflow-hidden",
            )}
          >
            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-600">{user?.email}</p>
          </div>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start bg-red-50 text-red-700 hover:bg-red-700 hover:text-white transition-all duration-200",
              !isHovered && "justify-center",
            )}
            onClick={logout}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            <span
              className={cn(
                "ml-3 transition-all duration-300",
                isHovered ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden",
              )}
            >
              Logout
            </span>
          </Button>
        </div>
      </aside>

      <div className={cn("transition-all duration-300", isHovered ? "ml-64" : "ml-20")}>
        <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-10 shadow-sm">
          <div className="px-8 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
              Client Portal
            </h1>
            <Button
              size="sm"
              className="gap-2 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
            >
              <MessageSquare className="h-4 w-4" />
              AI Assistant
            </Button>
          </div>
        </header>
        <main className="p-8">{children}</main>
      </div>
    </div>
  )
}
