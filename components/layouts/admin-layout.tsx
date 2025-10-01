"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Building2, LayoutDashboard, Users, UserCog, CreditCard, BarChart3, LogOut } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [isHovered, setIsHovered] = useState(false)

  const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/leads", label: "Lead Management", icon: Users },
    { href: "/admin/customers", label: "Customers", icon: UserCog },
    { href: "/admin/payments", label: "Payments & Ledger", icon: CreditCard },
    { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50/50 via-white to-blue-50/30">
      <aside
        className={cn(
          "fixed left-0 top-0 h-full bg-slate-50 border-r border-slate-200 shadow-lg transition-all duration-300 ease-in-out z-50",
          isHovered ? "w-64" : "w-20",
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="p-6 border-b border-slate-200">
          <Link href="/" className="flex items-center gap-2">
            <Building2 className="h-8 w-8 text-teal-600 flex-shrink-0" />
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
                    "w-full justify-start text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-all duration-200",
                    isActive && "bg-teal-50 text-teal-700 border-l-4 border-teal-500",
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

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200">
          <div
            className={cn(
              "mb-3 px-2 transition-all duration-300",
              isHovered ? "opacity-100" : "opacity-0 h-0 overflow-hidden",
            )}
          >
            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-600">{user?.email}</p>
            <p className="text-xs text-teal-600 font-medium mt-1">Admin</p>
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
        <header className="bg-white/80 backdrop-blur-sm border-b border-teal-100 sticky top-0 z-10 shadow-sm">
          <div className="px-8 py-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
              Admin Portal
            </h1>
          </div>
        </header>
        <main className="p-8">{children}</main>
      </div>
    </div>
  )
}
