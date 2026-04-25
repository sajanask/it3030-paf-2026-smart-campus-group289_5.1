import { useState } from 'react'

function SectionCard({ 
  title, 
  subtitle, 
  action, 
  children, 
  className = '',
  variant = 'default',
  icon = null,
  loading = false,
  collapsible = false,
  defaultCollapsed = false,
  noPadding = false,
  badge = null,
  badgeColor = 'teal'
}) {
  
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)

  const variants = {
    default: 'bg-white border border-slate-200 shadow-sm',
    gradient: 'bg-gradient-to-br from-white via-slate-50/50 to-slate-100/30 border border-slate-200 shadow-md',
    elevated: 'bg-white shadow-xl hover:shadow-2xl transition-all duration-300',
    bordered: 'bg-white border-2 border-slate-200 shadow-sm',
    glass: 'bg-white/80 backdrop-blur-md border border-white/20 shadow-xl'
  }

  const badgeColors = {
    teal: 'bg-teal-100 text-teal-700',
    blue: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
    emerald: 'bg-emerald-100 text-emerald-700',
    amber: 'bg-amber-100 text-amber-700',
    red: 'bg-red-100 text-red-700',
    slate: 'bg-slate-100 text-slate-700'
  }

  return (
    <section
      className={`
        group relative overflow-hidden rounded-2xl transition-all duration-300
        ${variants[variant]}
        ${noPadding ? '' : 'p-6'}
        ${loading ? 'pointer-events-none' : ''}
        ${collapsible && isCollapsed ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={() => collapsible && setIsCollapsed(!isCollapsed)}
    >
      {/* Animated gradient background for glass variant */}
      {variant === 'glass' && (
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 animate-pulse"></div>
      )}

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 transition-all duration-300">
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="h-12 w-12 rounded-full border-4 border-slate-200"></div>
              <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-4 border-teal-600 border-t-transparent animate-spin"></div>
            </div>
            <span className="text-sm font-medium text-slate-600">Loading content...</span>
          </div>
        </div>
      )}

      {/* Header */}
      {(title || subtitle || action || icon || badge) && !(collapsible && isCollapsed && !title) && (
        <div className={`
          relative z-0 flex flex-wrap items-start justify-between gap-4
          transition-all duration-300
          ${!noPadding && (title || subtitle || action || icon) ? 'pb-5 border-b border-slate-100' : ''}
          ${collapsible ? 'cursor-pointer hover:bg-slate-50/50 rounded-lg -m-2 p-2' : ''}
        `}>
          <div className="flex items-start gap-4 flex-1 min-w-0">
            {icon && (
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 text-white shadow-md">
                {icon}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                {title && (
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                    {title}
                  </h3>
                )}
                {badge && (
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${badgeColors[badgeColor]}`}>
                    {badge}
                  </span>
                )}
                {collapsible && (
                  <button className="ml-auto text-slate-400 hover:text-slate-600 transition-colors">
                    <svg 
                      className={`h-5 w-5 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                )}
              </div>
              {subtitle && (
                <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {action && !collapsible && (
            <div className="flex-shrink-0">
              {action}
            </div>
          )}
        </div>
      )}

      {/* Content with collapse animation */}
      {(!collapsible || !isCollapsed) && (
        <div className={`
          relative z-0 transition-all duration-300 ease-in-out
          ${collapsible ? 'pt-4 animate-in slide-in-from-top-2' : ''}
        `}>
          {children}
        </div>
      )}

      {/* Hover effect indicator for collapsible cards */}
      {collapsible && !isCollapsed && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-teal-500 to-cyan-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
      )}
    </section>
  )
}

// Export additional helper components
export const SectionCardGrid = ({ children, cols = 2, className = '' }) => (
  <div className={`grid gap-6 ${cols === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'} ${className}`}>
    {children}
  </div>
)

export const SectionCardDivider = ({ className = '' }) => (
  <div className={`my-6 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent ${className}`}></div>
)

export default SectionCard