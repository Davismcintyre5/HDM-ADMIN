import {
  HiShoppingCart, HiOfficeBuilding, HiShieldCheck, HiSparkles,
  HiLightningBolt, HiMusicNote, HiDocumentText, HiBriefcase,
  HiGlobe, HiMail, HiWifi, HiCash, HiShoppingBag
} from 'react-icons/hi'

export const systems = [
  {
    id: 'smartpos',
    name: 'SmartPOS',
    description: 'Point of sale management system',
    icon: HiShoppingCart,
    bgGradient: 'from-blue-500 to-blue-600',
    bgLight: 'bg-blue-50 dark:bg-blue-950',
    textColor: 'text-blue-600 dark:text-blue-400',
    borderColor: 'border-blue-200 dark:border-blue-800',
    hoverBg: 'hover:bg-blue-600',
    stats: { transactions: '12,456', revenue: '$234K', uptime: '99.9%' }
  },
  {
    id: 'hdmerp',
    name: 'HDM ERP',
    description: 'Enterprise resource planning',
    icon: HiOfficeBuilding,
    bgGradient: 'from-green-500 to-green-600',
    bgLight: 'bg-green-50 dark:bg-green-950',
    textColor: 'text-green-600 dark:text-green-400',
    borderColor: 'border-green-200 dark:border-green-800',
    hoverBg: 'hover:bg-green-600',
    stats: { employees: '1,234', projects: '89', efficiency: '94%' }
  },
  {
    id: 'nexguard',
    name: 'NexGuard',
    description: 'Cybersecurity & threat protection',
    icon: HiShieldCheck,
    bgGradient: 'from-cyan-500 to-blue-600',
    bgLight: 'bg-cyan-50 dark:bg-cyan-950',
    textColor: 'text-cyan-600 dark:text-cyan-400',
    borderColor: 'border-cyan-200 dark:border-cyan-800',
    hoverBg: 'hover:bg-cyan-600',
    stats: { devices: '1,234', threats: '89', uptime: '99.9%' }
  },
  {
    id: 'hdmai',
    name: 'HDM AI',
    description: 'Artificial intelligence & ML platform',
    icon: HiSparkles,
    bgGradient: 'from-fuchsia-500 to-fuchsia-600',
    bgLight: 'bg-fuchsia-50 dark:bg-fuchsia-950',
    textColor: 'text-fuchsia-600 dark:text-fuchsia-400',
    borderColor: 'border-fuchsia-200 dark:border-fuchsia-800',
    hoverBg: 'hover:bg-fuchsia-600',
    stats: { models: '234', accuracy: '97.8%', predictions: '1.2M' }
  },
  {
    id: 'spark',
    name: 'Spark',
    description: 'Privacy-first messaging by HDM',
    icon: HiLightningBolt,
    bgGradient: 'from-sky-500 to-sky-600',
    bgLight: 'bg-sky-50 dark:bg-sky-950',
    textColor: 'text-sky-600 dark:text-sky-400',
    borderColor: 'border-sky-200 dark:border-sky-800',
    hoverBg: 'hover:bg-sky-600',
    stats: { users: '8,901', messages: '1.2M', uptime: '99.9%' }
  },
  {
    id: 'docusoft',
    name: 'Docusoft',
    description: 'Document & software marketplace',
    icon: HiDocumentText,
    bgGradient: 'from-purple-500 to-purple-600',
    bgLight: 'bg-purple-50 dark:bg-purple-950',
    textColor: 'text-purple-600 dark:text-purple-400',
    borderColor: 'border-purple-200 dark:border-purple-800',
    hoverBg: 'hover:bg-purple-600',
    stats: { products: '1,234', downloads: '45K', sellers: '567' }
  },
  {
    id: 'portfolio',
    name: 'HDM Portfolio',
    description: 'Company portfolio & showcase',
    icon: HiBriefcase,
    bgGradient: 'from-emerald-500 to-green-600',
    bgLight: 'bg-emerald-50 dark:bg-emerald-950',
    textColor: 'text-emerald-600 dark:text-emerald-400',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    hoverBg: 'hover:bg-emerald-600',
    stats: { apps: '45', projects: '120', services: '12' }
  },
  {
    id: 'vibe',
    name: 'Vibe',
    description: 'Creative collaboration platform',
    icon: HiMusicNote,
    bgGradient: 'from-purple-500 via-violet-500 to-blue-500',
    bgLight: 'bg-purple-50 dark:bg-purple-950',
    textColor: 'text-purple-600 dark:text-purple-400',
    borderColor: 'border-purple-200 dark:border-purple-800',
    hoverBg: 'hover:bg-purple-600',
    stats: { users: '8,901', sessions: '23K', engagement: '87%' }
  },
  {
    id: 'bizhub',
    name: 'BizHub Kenya',
    description: 'Multi-module business platform',
    icon: HiGlobe,
    bgGradient: 'from-teal-500 to-cyan-600',
    bgLight: 'bg-teal-50 dark:bg-teal-950',
    textColor: 'text-teal-600 dark:text-teal-400',
    borderColor: 'border-teal-200 dark:border-teal-800',
    hoverBg: 'hover:bg-teal-600',
    stats: { modules: '4', users: '2,500', businesses: '890' }
  },
  {
    id: 'bridge',
    name: 'HDM Bridge',
    description: 'Email delivery & communication platform',
    icon: HiMail,
    bgGradient: 'from-indigo-500 to-blue-600',
    bgLight: 'bg-indigo-50 dark:bg-indigo-950',
    textColor: 'text-indigo-600 dark:text-indigo-400',
    borderColor: 'border-indigo-200 dark:border-indigo-800',
    hoverBg: 'hover:bg-indigo-600',
    stats: { emails: '1.2M', users: '3,400', delivery: '99.7%' }
  },
  {
    id: 'flax',
    name: 'Flax',
    description: 'Mobile money & payments',
    icon: HiCash,
    bgGradient: 'from-blue-600 to-blue-700',
    bgLight: 'bg-blue-50 dark:bg-blue-950',
    textColor: 'text-blue-600 dark:text-blue-400',
    borderColor: 'border-blue-200 dark:border-blue-800',
    hoverBg: 'hover:bg-blue-700',
    stats: { users: '10K', volume: 'KES 1.5M', uptime: '99.9%' }
  },
  {
    id: 'hdmnet',
    name: 'HDM NET',
    description: 'WiFi billing & hotspot management',
    icon: HiWifi,
    bgGradient: 'from-cyan-500 to-blue-600',
    bgLight: 'bg-cyan-50 dark:bg-cyan-950',
    textColor: 'text-cyan-600 dark:text-cyan-400',
    borderColor: 'border-cyan-200 dark:border-cyan-800',
    hoverBg: 'hover:bg-cyan-600',
    stats: { owners: '156', networks: '423', revenue: '$45K' }
  },
  {
    id: 'farmwise',
    name: 'FarmWise',
    description: 'Smart farm management system',
    icon: HiSparkles,
    bgGradient: 'from-emerald-500 to-green-600',
    bgLight: 'bg-emerald-50 dark:bg-emerald-950',
    textColor: 'text-emerald-600 dark:text-emerald-400',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    hoverBg: 'hover:bg-emerald-700',
    stats: { farms: '45', animals: '2.3K', alerts: '12' }
  },
  {
    id: 'marketbridge',
    name: 'MarketBridge',
    description: 'Multi-vendor marketplace',
    icon: HiShoppingBag,
    bgGradient: 'from-violet-500 to-purple-600',
    bgLight: 'bg-violet-50 dark:bg-violet-950',
    textColor: 'text-violet-600 dark:text-violet-400',
    borderColor: 'border-violet-200 dark:border-violet-800',
    hoverBg: 'hover:bg-violet-700',
    stats: { stores: '234', products: '12K', revenue: 'KES 5M' }
  }
]

export function getSystem(id) {
  return systems.find(s => s.id === id) || {
    id: 'unknown', name: 'System', description: 'Unknown system',
    icon: HiSparkles, bgGradient: 'from-gray-500 to-gray-600',
    bgLight: 'bg-gray-50 dark:bg-gray-900', textColor: 'text-gray-600 dark:text-gray-400',
    borderColor: 'border-gray-200 dark:border-gray-700', hoverBg: 'hover:bg-gray-600', stats: {}
  }
}