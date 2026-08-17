import { useNavigate } from 'react-router-dom'
import {
  HiShoppingCart, HiOfficeBuilding, HiShieldCheck, HiSparkles,
  HiLightningBolt, HiMusicNote, HiDocumentText, HiBriefcase, HiGlobe,
  HiMail, HiWifi, HiCash, HiShoppingBag, HiArrowRight,HiAcademicCap,HiChip
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
    id: 'nexguard', name: 'NexGuard', description: 'Cybersecurity & threat protection',
    icon: HiShieldCheck, bgGradient: 'from-cyan-500 to-blue-600', bgLight: 'bg-cyan-50 dark:bg-cyan-950',
    textColor: 'text-cyan-600 dark:text-cyan-400', borderColor: 'border-cyan-200 dark:border-cyan-800',
    hoverBg: 'hover:bg-cyan-600', stats: { devices: '1,234', threats: '89', uptime: '99.9%' }
  },
  {
    id: 'hdmai', name: 'HDM AI', description: 'Artificial intelligence & ML platform',
    icon: HiSparkles, bgGradient: 'from-fuchsia-500 to-fuchsia-600', bgLight: 'bg-fuchsia-50 dark:bg-fuchsia-950',
    textColor: 'text-fuchsia-600 dark:text-fuchsia-400', borderColor: 'border-fuchsia-200 dark:border-fuchsia-800',
    hoverBg: 'hover:bg-fuchsia-600', stats: { models: '234', accuracy: '97.8%', predictions: '1.2M' }
  },

  {
  id: 'hdmai2', name: 'HDM AI v2', description: 'AI model management & monitoring',
  icon: HiChip, bgGradient: 'from-blue-500 to-blue-600', bgLight: 'bg-blue-50 dark:bg-blue-950',
  textColor: 'text-blue-600 dark:text-blue-400', borderColor: 'border-blue-200 dark:border-blue-800',
  hoverBg: 'hover:bg-blue-600', stats: { models: '12', jobs: '45', users: '234' }
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
  },
  {
    id: 'bridge', name: 'HDM Bridge', description: 'Email delivery & communication platform',
    icon: HiMail, bgGradient: 'from-indigo-500 to-blue-600', bgLight: 'bg-indigo-50 dark:bg-indigo-950',
    textColor: 'text-indigo-600 dark:text-indigo-400', borderColor: 'border-indigo-200 dark:border-indigo-800',
    hoverBg: 'hover:bg-indigo-600', stats: { emails: '1.2M', users: '3,400', delivery: '99.7%' }
  },
  {
    id: 'flax', name: 'Flax', description: 'Mobile money & payments',
    icon: HiCash, bgGradient: 'from-blue-600 to-blue-700', bgLight: 'bg-blue-50 dark:bg-blue-950',
    textColor: 'text-blue-600 dark:text-blue-400', borderColor: 'border-blue-200 dark:border-blue-800',
    hoverBg: 'hover:bg-blue-700', stats: { users: '10K', volume: 'KES 1.5M', uptime: '99.9%' }
  },
  {
    id: 'hdmnet', name: 'HDM NET', description: 'WiFi billing & hotspot management',
    icon: HiWifi, bgGradient: 'from-cyan-500 to-blue-600', bgLight: 'bg-cyan-50 dark:bg-cyan-950',
    textColor: 'text-cyan-600 dark:text-cyan-400', borderColor: 'border-cyan-200 dark:border-cyan-800',
    hoverBg: 'hover:bg-cyan-600', stats: { owners: '156', networks: '423', revenue: '$45K' }
  },

  {
  id: 'farmvexa', name: 'FarmVexa', description: 'AI-Powered Farm Intelligence',
  icon: HiGlobe, bgGradient: 'from-emerald-500 to-green-600', bgLight: 'bg-emerald-50 dark:bg-emerald-950',
  textColor: 'text-emerald-600 dark:text-emerald-400', borderColor: 'border-emerald-200 dark:border-emerald-800',
  hoverBg: 'hover:bg-emerald-600', stats: { farmers: '50', farms: '120', devices: '3/5' }
},

  {
    id: 'marketbridge', name: 'MarketBridge', description: 'Multi-vendor marketplace',
    icon: HiShoppingBag, bgGradient: 'from-violet-500 to-purple-600', bgLight: 'bg-violet-50 dark:bg-violet-950',
    textColor: 'text-violet-600 dark:text-violet-400', borderColor: 'border-violet-200 dark:border-violet-800',
    hoverBg: 'hover:bg-violet-700', stats: { stores: '234', products: '12K', revenue: 'KES 5M' }
  },

  {
  id: 'rvnp', name: 'RVNP Hub', description: 'Campus community & digital quad',
  icon: HiAcademicCap, bgGradient: 'from-emerald-500 to-green-600', bgLight: 'bg-emerald-50 dark:bg-emerald-950',
  textColor: 'text-emerald-600 dark:text-emerald-400', borderColor: 'border-emerald-200 dark:border-emerald-800',
  hoverBg: 'hover:bg-emerald-600', stats: { users: '1,250', posts: '4.5K', groups: '28' }
},

{
  id: 'eduprime', name: 'EduPrime', description: 'School management & administration',
  icon: HiAcademicCap, bgGradient: 'from-amber-500 to-orange-600', bgLight: 'bg-amber-50 dark:bg-amber-950',
  textColor: 'text-amber-600 dark:text-amber-400', borderColor: 'border-amber-200 dark:border-amber-800',
  hoverBg: 'hover:bg-amber-600', stats: { schools: '45', students: '12K', teachers: '890' }
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
  );
}