import React from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { 
  Users, 
  FileText, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  User
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import useAuthStore from '../../../stores/authStore'
import Logo from '../../../shared/components/Logo'

const PortalLayout = () => {
  const navigate = useNavigate()
  const { user, logout, isAdmin, isEmployee } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = React.useState(false)

  const handleLogout = () => {
    logout()
    navigate('/portal/login')
  }

  const navItems = [
    {
      to: '/portal/customers',
      icon: Users,
      label: 'Customers',
      show: true
    },
    {
      to: '/portal/proposals',
      icon: FileText,
      label: 'Proposals',
      show: true
    },
    {
      to: '/portal/settings',
      icon: Settings,
      label: 'Settings',
      show: isAdmin() || isEmployee()
    }
  ].filter(item => item.show)

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Mobile Sidebar Backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: sidebarOpen ? 0 : '-100%'
        }}
        className="fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col lg:translate-x-0"
      >
        {/* Sidebar Header with Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
          <Logo size="md" showText={true} />
          
          {/* Mobile Close Button */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-lg bg-gray-50">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="w-5 h-5 text-blue-700" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.displayName || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.role || 'Role'}
              </p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu className="w-6 h-6 text-gray-600" />
          </button>

          {/* Desktop Logo (optional - you can remove this if logo is only in sidebar) */}
          <div className="lg:hidden">
            <Logo size="sm" showText={false} />
          </div>

          {/* User Info - Desktop */}
          <div className="hidden lg:flex items-center gap-4 ml-auto">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {user?.displayName || 'User'}
              </p>
              <p className="text-xs text-gray-500">
                {user?.role || 'Role'}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="w-5 h-5 text-blue-700" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default PortalLayout
