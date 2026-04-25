function PageHeader({ title, subtitle, actions, icon = null, className = '' }) {
  return (
    <div className={`relative mb-6 ${className}`}>
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 via-cyan-500/5 to-transparent rounded-2xl blur-3xl"></div>
      
      <div className="relative flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          {/* Icon circle */}
          {icon && (
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 shadow-lg">
              <div className="text-white">
                {icon}
              </div>
            </div>
          )}
          
          {/* Text content */}
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-teal-600">
                Smart Campus
              </span>
              <div className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse"></div>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1 text-sm text-slate-500 max-w-2xl">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        
        {/* Actions */}
        {actions && (
          <div className="flex flex-shrink-0 flex-wrap gap-2">
            {actions}
          </div>
        )}
      </div>
      
      {/* Bottom accent line */}
      <div className="mt-4 h-0.5 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full"></div>
    </div>
  )
}

export default PageHeader