
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Settings,
  Package
} from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

const SidebarNav = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (href: string) => {
    return location.pathname === href
  }

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Team',
      href: '/team',
      icon: Users,
    },
    {
      name: 'Calendar',
      href: '/calendar',
      icon: Calendar,
    },
    {
      name: 'Onboarding',
      href: '/onboarding',
      icon: FileText,
    },
    {
      name: 'Customs Tracker',
      href: '/customs-tracker',
      icon: Package,
    },
  ]

  return (
    <div className="flex flex-col space-y-6 w-full">
      {navigationItems.map((item) => (
        <Button
          key={item.href}
          variant="ghost"
          className={`h-9 w-full justify-start font-normal ${
            isActive(item.href)
              ? 'bg-accent bg-gradient-to-r from-purple-600 to-blue-600 hover:bg-secondary'
              : 'hover:bg-secondary'
          }`}
          onClick={() => navigate(item.href)}
        >
          <item.icon className="mr-2 h-4 w-4" />
          <span>{item.name}</span>
        </Button>
      ))}
      <Separator />
      <Button variant="ghost" className="h-9 w-full justify-start font-normal hover:bg-secondary">
        <Settings className="mr-2 h-4 w-4" />
        Settings
      </Button>
    </div>
  )
}

export default SidebarNav
