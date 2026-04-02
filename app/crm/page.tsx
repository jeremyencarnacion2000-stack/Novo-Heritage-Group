"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CRMLayout } from "@/components/crm/crm-layout"
import { DashboardAnalytics } from "@/components/crm/dashboard-analytics"
import { PropertiesAdvanced } from "@/components/crm/properties-advanced"
import { UsersManager } from "@/components/crm/users-manager"
import { LeadsPipeline } from "@/components/crm/leads-pipeline"
import { CalendarView } from "@/components/crm/calendar-view"
import { SettingsManager } from "@/components/crm/settings-manager"

export default function CRMPage() {
  const [userRole, setUserRole] = useState<string | null>(null)
  const [currentView, setCurrentView] = useState("dashboard")
  const router = useRouter()

  useEffect(() => {
    // Check user authentication and role
    const checkAccess = async () => {
      try {
        // For demo purposes, we'll simulate checking user role
        // In production, this would check the actual user session/token
        const storedRole = localStorage.getItem('userRole')

        // Allow 'admin' or 'agent' access, but restrict some features for agents if needed
        if (!storedRole || (storedRole !== 'admin' && storedRole !== 'agent')) {
          // If no role or not authorized, redirect (or show login)
          // For this demo, we'll simulate an admin login if nothing is stored to allow testing
          if (!storedRole) {
            localStorage.setItem('userRole', 'admin')
            setUserRole('admin')
            return
          }

          router.push('/login')
          return
        }

        setUserRole(storedRole)
      } catch (error) {
        console.error('Error checking access:', error)
        router.push('/login')
      }
    }

    checkAccess()
  }, [router])

  // Show loading while checking access
  if (userRole === null) {
    return (
      <div className="min-h-screen w-full relative bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando acceso...</p>
        </div>
      </div>
    )
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardAnalytics />
      case 'properties':
        return <PropertiesAdvanced />
      case 'users':
        return <UsersManager />
      case 'pipeline':
        return <LeadsPipeline />
      case 'calendar':
        return <CalendarView />
      case 'settings':
        return <SettingsManager />
      default:
        return <DashboardAnalytics />
    }
  }

  return (
    <CRMLayout
      currentView={currentView}
      onViewChange={setCurrentView}
      userRole={userRole}
    >
      {renderView()}
    </CRMLayout>
  )
}
