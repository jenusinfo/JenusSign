import React from 'react'
import { Outlet, useNavigate, NavLink } from 'react-router-dom'
import { Users, FileText, Settings, LogOut, Shield, Building2, UserCircle } from 'lucide-react'
import useAuthStore from '../../../stores/authStore'

const PortalLayout = () => {
  const navigate = useNavigate()
  const { user, logout, isAdmin } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/portal/login')
  }

  // Redirect if not authenticated
  if (!user) {
    navigate('/portal/login')
    return null
  }

  const roleIcons = {
    Admin: Shield,
    Employee: UserCircle,
    Broker: Building2,
    Agent: UserCircle,
  }

  const RoleIcon = roleIcons[user.role] || UserCircle

  const roleColors = {
    Admin: 'bg-red-100 text-red-800',
    Employee: 'bg-blue-100 text-blue-800',
    Broker: 'bg-orange-100 text-orange-800',
    Agent: 'bg-green-100 text-green-800',
  }

  const navigation = [
    { name: 'Customers', href: '/portal/customers', icon: Users, show: true },
    { name: 'Proposals', href: '/portal/proposals', icon: FileText, show: true },
    { name: 'Users', href: '/portal/users', icon: Settings, show: isAdmin() },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-primary-600">JenusSign</h1>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary-600 font-medium text-sm">
                  {user.displayName.charAt(0)}
                </span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.displayName}
              </p>
              <p className="text-xs text-gray-500 truncate">{user.businessKey}</p>
            </div>
          </div>
          <div className="mt-2">
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${roleColors[user.role]}`}>
              <RoleIcon size={12} />
              {user.role}
            </span>
          </div>
          {user.broker && (
            <div className="mt-2 text-xs text-gray-600">
              Broker: {user.broker.displayName}
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => item.show && (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`
              }
            >
              <item.icon size={20} />
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="pl-64">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {user.role === 'Broker' && (
                <span>Viewing data for all agents under you</span>
              )}
              {user.role === 'Agent' && (
                <span>Viewing your assigned data</span>
              )}
              {(user.role === 'Admin' || user.role === 'Employee') && (
                <span>Viewing all system data</span>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default PortalLayout
