// src/shared/pages/LandingPage.jsx
import { useNavigate } from 'react-router-dom'
import { HiArrowRight } from 'react-icons/hi'
import { systems } from '../../config/systems'

export default function LandingPage() {
  const navigate = useNavigate()

  const handleSystemClick = (systemId) => {
    navigate(`/${systemId}`)
  }

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] transition-colors duration-200">
      {/* Header */}
      <div className="bg-[var(--header-bg)] shadow-sm border-b border-[var(--border-color)] transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="text-center">
            <h1 className="text-2xl sm:text-4xl font-bold text-[var(--text-primary)] mb-1 sm:mb-2">
              HDM Admin Panel
            </h1>
            <p className="text-sm sm:text-lg text-[var(--text-secondary)]">
              Unified management dashboard for all your systems
            </p>
          </div>
        </div>
      </div>

      {/* System Cards Grid */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {systems.map((system) => (
            <div
              key={system.id}
              onClick={() => handleSystemClick(system.id)}
              className={`bg-[var(--card-bg)] rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg border ${system.borderColor} 
                cursor-pointer transform transition-all duration-300 hover:scale-[1.02] sm:hover:scale-105 hover:shadow-xl sm:hover:shadow-2xl
                overflow-hidden group`}
            >
              {/* Card Header with Gradient */}
              <div className={`bg-gradient-to-r ${system.bgGradient} p-4 sm:p-6 text-white`}>
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <system.icon className="text-2xl sm:text-4xl" />
                  <HiArrowRight className="text-lg sm:text-2xl opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-2 transition-all duration-300" />
                </div>
                <h2 className="text-lg sm:text-2xl font-bold mb-0.5 sm:mb-1">{system.name}</h2>
                <p className="text-white/80 sm:text-white/90 text-xs sm:text-sm">{system.description}</p>
              </div>

              {/* Stats Section */}
              <div className="p-3 sm:p-4 lg:p-6">
                <div className="grid grid-cols-3 gap-1 sm:gap-2">
                  {Object.entries(system.stats).map(([key, value]) => (
                    <div key={key} className="text-center">
                      <div className={`text-xs sm:text-sm font-bold ${system.textColor}`}>
                        {value}
                      </div>
                      <div className="text-[9px] sm:text-xs text-[var(--text-muted)] capitalize mt-0.5">
                        {key}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Launch Button */}
                <button
                  className={`mt-3 sm:mt-4 w-full bg-gradient-to-r ${system.bgGradient} text-white 
                    font-medium sm:font-semibold py-2 sm:py-2.5 px-4 sm:px-6 rounded-lg transition-all duration-300 
                    ${system.hoverBg} hover:shadow-lg flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm`}
                >
                  Launch {system.name}
                  <HiArrowRight className="group-hover:translate-x-1 transition-transform text-sm sm:text-base" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-4 sm:py-6 text-[var(--text-muted)] text-[10px] sm:text-xs">
        <p>HDM Systems &copy; 2026. All rights reserved.</p>
      </div>
    </div>
  )
}