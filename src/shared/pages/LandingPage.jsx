import { useNavigate } from 'react-router-dom'
import {
  HiShoppingCart, HiOfficeBuilding, HiShieldCheck, HiSparkles,
  HiLightningBolt, HiMusicNote, HiDocumentText, HiBriefcase, HiGlobe, HiArrowRight
} from 'react-icons/hi'

const systems = [
  {
    id: 'smartpos', name: 'SmartPOS', description: 'Point of sale management system',
    icon: HiShoppingCart, bgGradient: 'from-blue-500 to-blue-600', bgLight: 'bg-blue-50 dark:bg-blue-950',
    textColor: 'text-blue-600 dark:text-blue-400', borderColor: 'border-blue-200 dark:border-blue-800',
    hoverBg: 'hover:bg-blue-600', stats: { transactions: '12,456', revenue: '$234K', uptime: '99.9%' }
  },
  {
    id: 'hdmerp', name: 'HDM ERP', description: 'Enterprise resource planning',
    icon: HiOfficeBuilding, bgGradient: 'from-green-500 to-green-600', bgLight: 'bg-green-50 dark:bg-green-950',
    textColor: 'text-green-600 dark:text-green-400', borderColor: 'border-green-200 dark:border-green-800',
    hoverBg: 'hover:bg-green-600', stats: { employees: '1,234', projects: '89', efficiency: '94%' }
  },
  {
    id: 'hdmvault', name: 'HDM Vault', description: 'Secure data storage & management',
    icon: HiShieldCheck, bgGradient: 'from-orange-500 to-orange-600', bgLight: 'bg-orange-50 dark:bg-orange-950',
    textColor: 'text-orange-600 dark:text-orange-400', borderColor: 'border-orange-200 dark:border-orange-800',
    hoverBg: 'hover:bg-orange-600', stats: { files: '45,678', storage: '2.4 TB', encrypted: '100%' }
  },
  {
    id: 'hdmai', name: 'HDM AI', description: 'Artificial intelligence & ML platform',
    icon: HiSparkles, bgGradient: 'from-fuchsia-500 to-fuchsia-600', bgLight: 'bg-fuchsia-50 dark:bg-fuchsia-950',
    textColor: 'text-fuchsia-600 dark:text-fuchsia-400', borderColor: 'border-fuchsia-200 dark:border-fuchsia-800',
    hoverBg: 'hover:bg-fuchsia-600', stats: { models: '234', accuracy: '97.8%', predictions: '1.2M' }
  },
  {
    id: 'spark', name: 'Spark', description: 'Privacy-first messaging by HDM',
    icon: HiLightningBolt, bgGradient: 'from-sky-500 to-sky-600', bgLight: 'bg-sky-50 dark:bg-sky-950',
    textColor: 'text-sky-600 dark:text-sky-400', borderColor: 'border-sky-200 dark:border-sky-800',
    hoverBg: 'hover:bg-sky-600', stats: { users: '8,901', messages: '1.2M', uptime: '99.9%' }
  },
  {
    id: 'docusoft', name: 'Docusoft', description: 'Document & software marketplace',
    icon: HiDocumentText, bgGradient: 'from-purple-500 to-purple-600', bgLight: 'bg-purple-50 dark:bg-purple-950',
    textColor: 'text-purple-600 dark:text-purple-400', borderColor: 'border-purple-200 dark:border-purple-800',
    hoverBg: 'hover:bg-purple-600', stats: { products: '1,234', downloads: '45K', sellers: '567' }
  },
  {
    id: 'portfolio', name: 'HDM Portfolio', description: 'Company portfolio & showcase',
    icon: HiBriefcase, bgGradient: 'from-emerald-500 to-green-600', bgLight: 'bg-emerald-50 dark:bg-emerald-950',
    textColor: 'text-emerald-600 dark:text-emerald-400', borderColor: 'border-emerald-200 dark:border-emerald-800',
    hoverBg: 'hover:bg-emerald-600', stats: { apps: '45', projects: '120', services: '12' }
  },
  {
    id: 'vibe', name: 'Vibe', description: 'Creative collaboration platform',
    icon: HiMusicNote, bgGradient: 'from-purple-500 via-violet-500 to-blue-500', bgLight: 'bg-purple-50 dark:bg-purple-950',
    textColor: 'text-purple-600 dark:text-purple-400', borderColor: 'border-purple-200 dark:border-purple-800',
    hoverBg: 'hover:bg-purple-600', stats: { users: '8,901', sessions: '23K', engagement: '87%' }
  },
  {
    id: 'bizhub', name: 'BizHub Kenya', description: 'Multi-module business platform',
    icon: HiGlobe, bgGradient: 'from-teal-500 to-cyan-600', bgLight: 'bg-teal-50 dark:bg-teal-950',
    textColor: 'text-teal-600 dark:text-teal-400', borderColor: 'border-teal-200 dark:border-teal-800',
    hoverBg: 'hover:bg-teal-600', stats: { modules: '4', users: '2,500', businesses: '890' }
  }
]

export default function LandingPage() {
  const navigate = useNavigate()
  const handleSystemClick = (systemId) => navigate(`/${systemId}`)

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] transition-colors duration-200">
      <div className="bg-[var(--header-bg)] shadow-sm border-b border-[var(--border-color)] transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="text-center">
            <h1 className="text-2xl sm:text-4xl font-bold text-[var(--text-primary)] mb-1 sm:mb-2">HDM Admin Panel</h1>
            <p className="text-sm sm:text-lg text-[var(--text-secondary)]">Unified management dashboard for all your systems</p>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {systems.map((system) => (
            <div key={system.id} onClick={() => handleSystemClick(system.id)}
              className={`bg-[var(--card-bg)] rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg border ${system.borderColor} cursor-pointer transform transition-all duration-300 hover:scale-[1.02] sm:hover:scale-105 hover:shadow-xl sm:hover:shadow-2xl overflow-hidden group`}>
              <div className={`bg-gradient-to-r ${system.bgGradient} p-4 sm:p-6 text-white`}>
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <system.icon className="text-2xl sm:text-4xl" />
                  <HiArrowRight className="text-lg sm:text-2xl opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-2 transition-all duration-300" />
                </div>
                <h2 className="text-lg sm:text-2xl font-bold mb-0.5 sm:mb-1">{system.name}</h2>
                <p className="text-white/80 sm:text-white/90 text-xs sm:text-sm">{system.description}</p>
              </div>
              <div className="p-3 sm:p-4">
                <div className="grid grid-cols-3 gap-1 sm:gap-2">
                  {Object.entries(system.stats).map(([key, value]) => (
                    <div key={key} className="text-center">
                      <div className={`text-xs sm:text-sm font-bold ${system.textColor}`}>{value}</div>
                      <div className="text-[9px] sm:text-xs text-[var(--text-muted)] capitalize mt-0.5">{key}</div>
                    </div>
                  ))}
                </div>
                <button className={`mt-3 sm:mt-4 w-full bg-gradient-to-r ${system.bgGradient} text-white font-medium sm:font-semibold py-2 sm:py-2.5 px-4 sm:px-6 rounded-lg transition-all duration-300 ${system.hoverBg} hover:shadow-lg flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm`}>
                  Launch {system.name} <HiArrowRight className="group-hover:translate-x-1 transition-transform text-sm sm:text-base" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="text-center py-4 sm:py-6 text-[var(--text-muted)] text-[10px] sm:text-xs">
        <p>HDM Systems &copy; 2026. All rights reserved.</p>
      </div>
    </div>
  )
}