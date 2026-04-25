import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import Navbar from './Navbar'

function AppShell({ user, onLogout, onProfileClick, children }) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile sidebar when route changes
  useEffect(() => {
    setIsMobileSidebarOpen(false)
  }, [window.location.pathname])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Animated background pattern */}
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <div className="absolute inset-0 bg-grid-slate-200 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]"></div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-all duration-300 animate-in fade-in"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out lg:hidden
        ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar user={user} onClose={() => setIsMobileSidebarOpen(false)} />
      </div>

      {/* Main Container */}
      <div className="relative mx-auto flex min-h-screen max-w-[1440px] flex-col gap-4 px-3 py-4 sm:px-4 sm:py-6 md:px-6 lg:flex-row lg:gap-6 lg:py-8 xl:px-8">
        
        {/* Desktop Sidebar */}
        <div className="hidden lg:block lg:flex-shrink-0">
          <Sidebar user={user} />
        </div>

        {/* Main Content Area */}
        <main className={`
          relative flex-1 space-y-4 transition-all duration-300
          lg:space-y-6 pb-8 lg:pb-10
          ${scrolled ? 'lg:pt-2' : ''}
        `}>
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="lg:hidden fixed bottom-6 right-6 z-30 rounded-full bg-gradient-to-r from-teal-600 to-cyan-600 p-3 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Navbar with scroll effect */}
          <div className={`
            sticky top-0 z-20 transition-all duration-300
            ${scrolled ? '-mt-2 pt-2' : ''}
          `}>
            <Navbar 
              user={user} 
              onLogout={onLogout} 
              onProfileClick={onProfileClick}
              onMobileMenuClick={() => setIsMobileSidebarOpen(true)}
            />
          </div>

          {/* Page Content with fade-in animation */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>

          {/* Footer */}
          <footer className="mt-8 border-t border-slate-200 pt-6 text-center">
            <div className="flex flex-col items-center justify-between gap-3 text-xs text-slate-500 sm:flex-row">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse"></div>
                <span>Smart Campus Operations Portal</span>
              </div>
              <div className="flex gap-4">
                <a href="#" className="hover:text-teal-600 transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-teal-600 transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-teal-600 transition-colors">Contact Support</a>
              </div>
              <div>
                <span>© 2024 Smart Campus. All rights reserved.</span>
              </div>
            </div>
          </footer>
        </main>
      </div>

      {/* Scroll to top button */}
      {scrolled && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-30 hidden lg:flex rounded-full bg-white border border-slate-200 p-2 shadow-md hover:shadow-lg transition-all hover:scale-105 group"
        >
          <svg className="h-5 w-5 text-slate-600 group-hover:text-teal-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}
    </div>
  )
}

// Add CSS for grid background (add to your global CSS file)
const styles = `
  .bg-grid-slate-200 {
    background-image: linear-gradient(to right, #e2e8f0 1px, transparent 1px),
                      linear-gradient(to bottom, #e2e8f0 1px, transparent 1px);
    background-size: 50px 50px;
  }
`

// Inject styles if needed
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style')
  styleSheet.textContent = styles
  document.head.appendChild(styleSheet)
}

export default AppShell