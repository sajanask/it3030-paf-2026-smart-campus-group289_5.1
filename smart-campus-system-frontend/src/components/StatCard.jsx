function StatCard({ 
  label, 
  value, 
  helper, 
  tone = 'default',
  icon = null,
  trend = null,
  loading = false,
  onClick = null,
  size = 'default',
  animateNumber = false
}) {
  
  const [animatedValue, setAnimatedValue] = useState(0)
  
  const config = {
    default: { bg: 'bg-white', border: 'border-slate-200', accent: 'from-slate-500 to-slate-600' },
    success: { bg: 'bg-emerald-50', border: 'border-emerald-200', accent: 'from-emerald-500 to-green-500' },
    warning: { bg: 'bg-amber-50', border: 'border-amber-200', accent: 'from-amber-500 to-orange-500' },
    danger: { bg: 'bg-red-50', border: 'border-red-200', accent: 'from-red-500 to-rose-500' },
    info: { bg: 'bg-blue-50', border: 'border-blue-200', accent: 'from-blue-500 to-indigo-500' },
    teal: { bg: 'bg-teal-50', border: 'border-teal-200', accent: 'from-teal-500 to-cyan-500' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', accent: 'from-purple-500 to-pink-500' }
  }

  const sizes = {
    small: { padding: 'p-3', valueSize: 'text-xl', iconSize: 'h-8 w-8' },
    default: { padding: 'p-4', valueSize: 'text-2xl', iconSize: 'h-10 w-10' },
    large: { padding: 'p-5', valueSize: 'text-3xl', iconSize: 'h-12 w-12' }
  }

  const current = config[tone]
  const currentSize = sizes[size]

  // Number animation
  useEffect(() => {
    if (animateNumber && !loading && typeof value === 'number') {
      let start = 0
      const end = value
      const duration = 800
      const step = (end - start) / (duration / 16)
      
      const timer = setInterval(() => {
        start += step
        if (start >= end) {
          setAnimatedValue(end)
          clearInterval(timer)
        } else {
          setAnimatedValue(Math.floor(start))
        }
      }, 16)
      
      return () => clearInterval(timer)
    } else {
      setAnimatedValue(value)
    }
  }, [value, animateNumber, loading])

  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl border transition-all duration-300
        ${current.bg} ${current.border}
        ${onClick ? 'cursor-pointer hover:shadow-lg hover:-translate-y-0.5' : ''}
        ${currentSize.padding}
      `}
      onClick={onClick}
    >
      {/* Gradient accent bar */}
      <div className={`absolute top-0 left-0 h-1 w-full bg-gradient-to-r ${current.accent}`}></div>
      
      {loading && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center rounded-2xl">
          <div className="flex flex-col items-center gap-2">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-teal-600 border-t-transparent"></div>
            <span className="text-xs text-slate-500">Loading...</span>
          </div>
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {label}
          </p>
          <p className={`mt-2 font-bold text-slate-900 ${currentSize.valueSize}`}>
            {typeof animatedValue === 'number' ? animatedValue.toLocaleString() : animatedValue}
          </p>
          {helper && (
            <div className="mt-1 flex items-center gap-2">
              <p className="text-xs text-slate-500">{helper}</p>
              {trend && (
                <span className={`text-xs font-semibold ${trend > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {trend > 0 ? `+${trend}%` : `${trend}%`}
                </span>
              )}
            </div>
          )}
        </div>
        
        {icon && (
          <div className={`flex items-center justify-center rounded-xl bg-white/50 shadow-sm ${currentSize.iconSize}`}>
            <div className="h-5 w-5 text-slate-600">
              {icon}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default StatCard