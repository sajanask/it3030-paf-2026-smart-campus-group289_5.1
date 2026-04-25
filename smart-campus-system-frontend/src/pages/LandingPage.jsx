import { Link, Navigate } from 'react-router-dom'
import { hasToken } from '../utils/token'
import { useState, useEffect } from 'react'

function LandingPage() {
  const [isVisible, setIsVisible] = useState({})
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  if (hasToken()) {
    return <Navigate to="/dashboard" replace />
  }

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    
    // Intersection Observer for fade-in effects
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsVisible(prev => ({ ...prev, [entry.target.id]: true }))
          }
        })
      },
      { threshold: 0.1 }
    )
    
    document.querySelectorAll('.fade-section').forEach(section => {
      observer.observe(section)
    })
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      observer.disconnect()
    }
  }, [])

  const features = [
    {
      icon: '🎫',
      title: 'Smart Ticket System',
      desc: 'Create, track, and resolve maintenance tickets with real-time updates and priority management.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: '👥',
      title: 'Role-Based Access',
      desc: 'Admin, Technician, and User roles with granular permissions and custom workflows.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: '📊',
      title: 'Analytics Dashboard',
      desc: 'Comprehensive insights with real-time metrics, reports, and performance tracking.',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: '🔔',
      title: 'Smart Notifications',
      desc: 'Real-time alerts via email, SMS, and in-app notifications for critical updates.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: '📅',
      title: 'Resource Booking',
      desc: 'Efficiently manage and book campus resources, labs, and equipment.',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      icon: '⚡',
      title: 'Quick Response',
      desc: 'Automated routing and assignment for faster issue resolution.',
      color: 'from-yellow-500 to-orange-500'
    }
  ]

  const stats = [
    { value: '99.9%', label: 'Uptime', icon: '📈' },
    { value: '< 2hr', label: 'Avg Response', icon: '⚡' },
    { value: '10k+', label: 'Tickets Resolved', icon: '✅' },
    { value: '24/7', label: 'Support', icon: '🔄' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-x-hidden">
      
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        
        {/* Mouse follower gradient */}
        <div 
          className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-teal-500/20 to-cyan-500/20 filter blur-3xl transition-transform duration-300"
          style={{ 
            transform: `translate(${mousePosition.x - 192}px, ${mousePosition.y - 192}px)`,
            transition: 'transform 0.1s ease-out'
          }}
        />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            {/* Animated badge */}
            <div className="inline-flex animate-bounce">
              <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-500/20 to-cyan-500/20 px-4 py-1.5 text-sm font-semibold text-teal-300 border border-teal-500/30 backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                </span>
                Welcome to the Future
              </span>
            </div>
            
            {/* Main heading */}
            <h1 className="mt-8 text-5xl font-bold tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl">
              Smart Campus
              <span className="block mt-2 bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Operations Hub
              </span>
            </h1>
            
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-300 sm:text-xl">
              Transform your campus management with AI-powered ticketing, real-time analytics, 
              and seamless resource coordination. Experience efficiency like never before.
            </p>
            
            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/login"
                className="group relative inline-flex items-center justify-center rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 px-8 py-3 text-sm font-semibold text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-teal-500/25"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Get Started
                  <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-teal-600 to-cyan-600 opacity-0 transition-opacity group-hover:opacity-100"></div>
              </Link>
              
              <Link
                to="/register"
                className="group relative inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-8 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/20 hover:scale-105"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Create Account
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </span>
              </Link>
            </div>
            
            {/* Stats */}
            <div className="mt-20 grid grid-cols-2 gap-8 sm:grid-cols-4">
              {stats.map((stat, idx) => (
                <div key={idx} className="text-center">
                  <div className="text-4xl font-bold text-white sm:text-5xl">
                    <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                      {stat.value}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-center gap-1 text-sm text-gray-400">
                    <span>{stat.icon}</span>
                    <span>{stat.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="flex flex-col items-center gap-2 text-sm text-gray-400">
            <span>Scroll to explore</span>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-24 sm:py-32">
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-base font-semibold leading-7 text-teal-400">Features</h2>
            <p className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Everything you need to succeed
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              Powerful tools designed to streamline campus operations and enhance productivity.
            </p>
          </div>
          
          <div className="mt-20 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, idx) => (
              <div 
                key={idx}
                className="group relative rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6 transition-all duration-300 hover:scale-105 hover:bg-white/10"
              >
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${feature.color} opacity-0 blur-xl transition-opacity group-hover:opacity-20`}></div>
                <div className="relative">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-24 sm:py-32 bg-gradient-to-b from-transparent to-white/5">
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-base font-semibold leading-7 text-teal-400">Simple Process</h2>
            <p className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              How it works
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              Get started in minutes with our intuitive workflow
            </p>
          </div>
          
          <div className="mt-20 grid gap-8 lg:grid-cols-4">
            {[
              { step: '01', title: 'Create Ticket', desc: 'Submit your issue with details and priority', icon: '📝' },
              { step: '02', title: 'Smart Routing', desc: 'AI automatically assigns to right team', icon: '🎯' },
              { step: '03', title: 'Real-time Updates', desc: 'Track progress and receive notifications', icon: '📢' },
              { step: '04', title: 'Resolution', desc: 'Get your issue resolved and provide feedback', icon: '✅' }
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="relative">
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-teal-500 to-cyan-500">
                    <span className="text-2xl">{item.icon}</span>
                  </div>
                  {idx < 3 && (
                    <div className="hidden lg:block absolute top-10 left-full w-full border-t-2 border-dashed border-white/20"></div>
                  )}
                </div>
                <div className="mt-4 text-sm font-semibold text-teal-400">{item.step}</div>
                <h3 className="mt-2 text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="relative py-24 sm:py-32">
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-base font-semibold leading-7 text-teal-400">Testimonials</h2>
            <p className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Trusted by campus leaders
            </p>
          </div>
          
          <div className="mt-20 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              { name: 'Dr. Sarah Johnson', role: 'University Director', content: 'This platform has revolutionized our campus maintenance operations. Response times have improved by 60%.', rating: 5 },
              { name: 'Michael Chen', role: 'IT Manager', content: 'The analytics dashboard gives us unprecedented insights. Highly recommended for any institution.', rating: 5 },
              { name: 'Prof. Emily Rodriguez', role: 'Faculty Lead', content: 'Managing lab resources has never been easier. The booking system is intuitive and efficient.', rating: 5 }
            ].map((testimonial, idx) => (
              <div key={idx} className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg key={i} className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-300 mb-4">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold text-white">{testimonial.name}</p>
                  <p className="text-sm text-gray-400">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 sm:py-32">
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-600/20 to-cyan-600/20 backdrop-blur-sm border border-white/20 p-8 text-center sm:p-12">
            <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]"></div>
            <div className="relative">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Ready to transform your campus?
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-300">
                Join thousands of satisfied users and experience the future of campus management today.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 px-8 py-3 text-sm font-semibold text-white transition-all hover:scale-105"
                >
                  Start Free Trial
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-8 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
                >
                  Contact Sales
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/10 py-12">
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Smart Campus</h3>
              <p className="mt-2 text-sm text-gray-400">Modern campus management solution for educational institutions.</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Product</h4>
              <ul className="mt-4 space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-teal-400 transition">Features</a></li>
                <li><a href="#" className="hover:text-teal-400 transition">Pricing</a></li>
                <li><a href="#" className="hover:text-teal-400 transition">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Company</h4>
              <ul className="mt-4 space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-teal-400 transition">About</a></li>
                <li><a href="#" className="hover:text-teal-400 transition">Blog</a></li>
                <li><a href="#" className="hover:text-teal-400 transition">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Legal</h4>
              <ul className="mt-4 space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-teal-400 transition">Privacy</a></li>
                <li><a href="#" className="hover:text-teal-400 transition">Terms</a></li>
                <li><a href="#" className="hover:text-teal-400 transition">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 text-center text-sm text-gray-400 border-t border-white/10">
            <p>&copy; 2024 Smart Campus. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}

export default LandingPage