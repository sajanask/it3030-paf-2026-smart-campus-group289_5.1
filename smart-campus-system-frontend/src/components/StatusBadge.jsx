function StatusBadge({ 
  status, 
  kind = 'status',
  size = 'default',
  showIcon = true,
  rounded = 'full',
  className = ''
}) {
  
  const getColorScheme = () => {
    const schemes = {
      // Status colors
      OPEN: 'bg-blue-100 text-blue-800 border-blue-200',
      IN_PROGRESS: 'bg-amber-100 text-amber-800 border-amber-200',
      RESOLVED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      CLOSED: 'bg-slate-100 text-slate-800 border-slate-200',
      REJECTED: 'bg-red-100 text-red-800 border-red-200',
      PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
      APPROVED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      CANCELLED: 'bg-slate-100 text-slate-800 border-slate-200',
      
      // Priority colors
      LOW: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      MEDIUM: 'bg-amber-100 text-amber-800 border-amber-200',
      HIGH: 'bg-red-100 text-red-800 border-red-200',
      
      // Resource status
      ACTIVE: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      OUT_OF_SERVICE: 'bg-slate-100 text-slate-800 border-slate-200'
    }
    
    return schemes[status] || 'bg-slate-100 text-slate-800 border-slate-200'
  }
  
  const getIcon = () => {
    const icons = {
      OPEN: '🟢',
      IN_PROGRESS: '⚙️',
      RESOLVED: '✓',
      CLOSED: '🔒',
      REJECTED: '✗',
      PENDING: '⏳',
      APPROVED: '✓',
      CANCELLED: '○',
      LOW: '🔽',
      MEDIUM: '▶️',
      HIGH: '🔴',
      ACTIVE: '✓',
      OUT_OF_SERVICE: '⚠️'
    }
    return icons[status] || '•'
  }
  
  const sizeClasses = {
    small: 'px-2 py-0.5 text-[10px]',
    default: 'px-2.5 py-1 text-xs',
    large: 'px-3 py-1.5 text-sm'
  }
  
  const roundedClasses = {
    none: 'rounded',
    sm: 'rounded-md',
    md: 'rounded-lg',
    full: 'rounded-full'
  }
  
  const colorScheme = getColorScheme()
  const icon = getIcon()
  
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-semibold border
        ${colorScheme}
        ${sizeClasses[size]}
        ${roundedClasses[rounded]}
        transition-all duration-200 hover:scale-105
        ${className}
      `}
    >
      {showIcon && <span className="text-inherit">{icon}</span>}
      <span>{status}</span>
    </span>
  )
}

export default StatusBadge