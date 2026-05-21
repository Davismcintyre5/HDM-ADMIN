// src/shared/pages/ComingSoon.jsx
import { useLocation, useNavigate } from 'react-router-dom'
import { HiArrowLeft, HiClock } from 'react-icons/hi'
import { getSystem } from '../../config/systems'

export default function ComingSoon() {
  const location = useLocation()
  const navigate = useNavigate()

  const path = location.pathname.split('/')[1]
  const system = getSystem(path)

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] flex items-center justify-center transition-colors duration-200">
      <div className="max-w-md w-full mx-4">
        <div className="bg-[var(--card-bg)] rounded-2xl shadow-xl overflow-hidden border border-[var(--border-color)] transition-colors duration-200">
          {/* Header */}
          <div className={`bg-gradient-to-r ${system.bgGradient} p-8 text-white text-center`}>
            <HiClock className="text-6xl mx-auto mb-4 animate-pulse" />
            <h1 className="text-3xl font-bold mb-2">{system.name}</h1>
            <p className="text-white/90">{system.description}</p>
          </div>

          {/* Body */}
          <div className="p-8 text-center">
            <div className={`inline-block ${system.bgLight} rounded-full p-4 mb-6 transition-colors duration-200`}>
              <HiClock className={`text-4xl ${system.textColor}`} />
            </div>

            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3 transition-colors duration-200">
              Coming Soon
            </h2>

            <p className="text-[var(--text-secondary)] mb-8 transition-colors duration-200">
              We're working hard to bring you the {system.name} admin panel.
              This system is currently under development and will be available soon.
            </p>

            <button
              onClick={() => navigate('/')}
              className={`w-full bg-gradient-to-r ${system.bgGradient} text-white 
                font-semibold py-3 px-6 rounded-lg transition-all duration-300 
                hover:shadow-lg flex items-center justify-center gap-2`}
            >
              <HiArrowLeft className="text-xl" />
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}