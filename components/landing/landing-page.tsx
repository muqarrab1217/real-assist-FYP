"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, TrendingUp, Shield, Zap, MessageSquare, BarChart3 } from "lucide-react"
import Link from "next/link"

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white">
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">RealAssist</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Features
            </Link>
            <Link href="#benefits" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Benefits
            </Link>
            <Link href="#contact" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Contact
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm" className="text-gray-700 hover:text-gray-900">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
            <Zap className="h-4 w-4" />
            AI-Powered Real Estate Automation
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-balance leading-tight text-gray-900">
            Transform Your Real Estate Operations with <span className="text-blue-600">Intelligent Automation</span>
          </h1>
          <p className="text-xl text-gray-600 text-balance max-w-2xl mx-auto leading-relaxed">
            Streamline property management, automate client communications, and gain real-time insights into your real
            estate portfolio.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/auth/register">
              <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
              >
                Client Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Powerful Features for Modern Real Estate</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need to manage properties, clients, and transactions efficiently
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-2 border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all bg-white">
            <CardHeader>
              <MessageSquare className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle className="text-gray-900">AI Assistant</CardTitle>
              <CardDescription className="text-gray-600">
                24/7 intelligent chatbot and voicebot for instant client support and queries
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 border-gray-200 hover:border-teal-400 hover:shadow-lg transition-all bg-white">
            <CardHeader>
              <TrendingUp className="h-10 w-10 text-teal-600 mb-2" />
              <CardTitle className="text-gray-900">Lead Management</CardTitle>
              <CardDescription className="text-gray-600">
                AI-powered lead classification and tracking with hot, cold, and dead lead categorization
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all bg-white">
            <CardHeader>
              <BarChart3 className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle className="text-gray-900">Real-Time Analytics</CardTitle>
              <CardDescription className="text-gray-600">
                Comprehensive dashboards with insights into payments, leads, and project progress
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 border-gray-200 hover:border-teal-400 hover:shadow-lg transition-all bg-white">
            <CardHeader>
              <Shield className="h-10 w-10 text-teal-600 mb-2" />
              <CardTitle className="text-gray-900">Automated Ledger</CardTitle>
              <CardDescription className="text-gray-600">
                Auto-updated financial records with instant PDF and Excel export capabilities
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all bg-white">
            <CardHeader>
              <Building2 className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle className="text-gray-900">Project Tracking</CardTitle>
              <CardDescription className="text-gray-600">
                Monitor construction progress with milestone tracking and client updates
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 border-gray-200 hover:border-teal-400 hover:shadow-lg transition-all bg-white">
            <CardHeader>
              <Zap className="h-10 w-10 text-teal-600 mb-2" />
              <CardTitle className="text-gray-900">Payment Integration</CardTitle>
              <CardDescription className="text-gray-600">
                Seamless payment processing with automated installment tracking and reminders
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="bg-blue-50/50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Built for Real Estate Professionals</h2>
            <p className="text-lg text-gray-600">Trusted by developers, investors, and sales teams worldwide</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center space-y-2">
              <div className="text-4xl font-bold text-blue-600">85%</div>
              <div className="text-sm text-gray-600">Reduction in manual tasks</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl font-bold text-teal-600">3x</div>
              <div className="text-sm text-gray-600">Faster lead response time</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl font-bold text-blue-600">99%</div>
              <div className="text-sm text-gray-600">Client satisfaction rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="bg-gradient-to-r from-blue-600 to-teal-600 text-white border-0 shadow-xl">
          <CardContent className="p-12 text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">Ready to Transform Your Real Estate Business?</h2>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              Join hundreds of real estate professionals who have automated their operations with RealAssist
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/auth/register">
                <Button
                  size="lg"
                  variant="secondary"
                  className="w-full sm:w-auto bg-white text-blue-700 hover:bg-gray-100"
                >
                  Get Started Free
                </Button>
              </Link>
              <Link href="#contact">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto bg-transparent border-white text-white hover:bg-white/10"
                >
                  Schedule Demo
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-blue-600" />
              <span className="font-semibold text-gray-900">RealAssist</span>
            </div>
            <p className="text-sm text-gray-600">© 2025 RealAssist. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Floating Chatbot Button */}
      <button className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-r from-blue-600 to-teal-600 text-white shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center">
        <MessageSquare className="h-6 w-6" />
      </button>
    </div>
  )
}
