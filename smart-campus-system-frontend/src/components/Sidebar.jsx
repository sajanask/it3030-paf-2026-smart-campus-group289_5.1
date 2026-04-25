import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'

const navItems = [
  { 
    label: 'Dashboard', 
    to: '/dashboard', 
    roles: ['USER', 'ADMIN', 'TECHNICIAN'],
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )
  },
  { 
    label: 'Resources', 
    to: '/resources', 
    roles: ['USER', 'ADMIN'],
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    )
  },
  { 
    label: 'Book Resource', 
    to: '/bookings/create', 
    roles: ['USER', 'ADMIN'],
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )
  },
  { 
    label: 'My Bookings', 
    to: '/bookings/my', 
    roles: ['USER', 'ADMIN'],
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    )
  },
  { 
    label: 'Create Ticket', 
    to: '/tickets/create', 
    roles: ['USER', 'ADMIN'],
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    )
  },
  { 
    label: 'My Tickets', 
    to: '/tickets/my', 
    roles: ['USER', 'ADMIN'],
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
  },
  { 
    label: 'Admin Tickets', 
    to: '/admin/tickets', 
    roles: ['ADMIN'],
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    )
  },
  { 
    label: 'Admin Bookings', 
    to: '/admin/bookings', 
    roles: ['ADMIN'],
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    )
  },
  { 
    label: 'Assigned Tickets', 
    to: '/technician/tickets', 
    roles: ['TECHNICIAN'],
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    )
  },
]

function Sidebar({ user }) {
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const role = user?.role || 'USER'

  const links = navItems.filter((item) => item.roles.includes(role))

  const roleColors = {
    ADMIN: 'from-purple-600 to-pink-600',
    TECHNICIAN: 'from-blue-600 to-cyan-600',
    USER: 'from-teal-600 to-cyan-600'
  }

  const roleGradient = roleColors[role] || roleColors.USER

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="fixed bottom-6 right-6 z-50 rounded-full bg-gradient-to-r from-teal-600 to-cyan-600 p-3 text-white shadow-lg lg:hidden transition-all hover:scale-105"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-40 flex flex-col
          transition-all duration-300 ease-in-out transform
          ${collapsed ? 'translate-x-0' : '-translate-x-full'}
          lg:relative lg:translate-x-0
          min-h-full w-[260px] flex-shrink-0
          rounded-r-2xl lg:rounded-2xl
          bg-white shadow-xl lg:shadow-sm
          border-r border-slate-200 lg:border
        `}
      >
        {/* Header Section */}
        <div className="relative overflow-hidden rounded-t-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-cyan-500/10"></div>
          <div className="relative px-4 py-6 lg:px-5">
            <div className="flex items-center gap-3">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-200"></div>
                <div className="relative grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-teal-600 to-cyan-600 text-base font-bold uppercase text-white shadow-lg">
                  {user?.name?.slice(0, 2) || 'SC'}
                </div>
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-600">
                  Smart Campus
                </p>
                <p className="text-sm font-semibold text-slate-900 line-clamp-1">
                  {user?.name || 'User'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 lg:px-4">
          <div className="space-y-1">
            {links.map((item) => {
              const active = location.pathname === item.to || location.pathname.startsWith(item.to + '/')
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setCollapsed(false)}
                  className={`
                    group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200
                    ${active 
                      ? 'bg-gradient-to-r from-teal-50 to-cyan-50 text-teal-700 shadow-sm' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }
                  `}
                >
                  {/* Active Indicator */}
                  {active && (
                    <div className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-teal-500 to-cyan-500"></div>
                  )}
                  
                  {/* Icon */}
                  <div className={`
                    transition-all duration-200
                    ${active 
                      ? 'text-teal-600' 
                      : 'text-slate-400 group-hover:text-teal-500'
                    }
                  `}>
                    {item.icon}
                  </div>
                  
                  {/* Label */}
                  <span className="flex-1">{item.label}</span>
                  
                  {/* Hover Arrow */}
                  {!active && (
                    <svg 
                      className="h-4 w-4 text-slate-300 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Footer Section */}
        <div className="border-t border-slate-200 p-4">
          {/* Role Badge */}
          <div className="relative mb-3 overflow-hidden rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 p-3">
            <div className="absolute top-0 right-0 h-16 w-16 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 rounded-full blur-xl"></div>
            <div className="relative">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Current Role
              </p>
              <div className={`mt-2 inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${roleGradient} px-3 py-1.5 shadow-md`}>
                <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse"></div>
                <span className="text-xs font-bold text-white">{role}</span>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="rounded-xl bg-slate-50 p-3">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="truncate">{user?.email || 'user@smartcampus.com'}</span>
            </div>
          </div>
        </div>

        {/* Collapse Button for Desktop */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 hidden lg:flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white shadow-md hover:shadow-lg transition-all"
        >
          <svg 
            className={`h-3 w-3 text-slate-600 transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </aside>

      {/* Overlay for mobile */}
      {collapsed && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden transition-all duration-300"
          onClick={() => setCollapsed(false)}
        />
      )}
    </>
  )
}

export default Sidebar
