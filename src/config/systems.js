import {
  HiShoppingCart, HiShieldCheck, HiSparkles,
  HiBriefcase, HiGlobe,
  HiMail, HiWifi, HiCash, HiShoppingBag, HiAcademicCap,
  HiPlus, HiCloud,
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
    id: 'portfolio',
    name: 'HDM',
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
    id: 'farmvexa',
    name: 'FarmVexa',
    description: 'AI-Powered Farm Intelligence',
    icon: HiGlobe,
    bgGradient: 'from-emerald-500 to-green-600',
    bgLight: 'bg-emerald-50 dark:bg-emerald-950',
    textColor: 'text-emerald-600 dark:text-emerald-400',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    hoverBg: 'hover:bg-emerald-600',
    stats: { farmers: '50', farms: '120', devices: '3/5' }
  },
  {
    id: 'pharmasys',
    name: 'PharmaSys',
    description: 'Pharmacy management system',
    icon: HiPlus,
    bgGradient: 'from-rose-500 to-pink-600',
    bgLight: 'bg-rose-50 dark:bg-rose-950',
    textColor: 'text-rose-600 dark:text-rose-400',
    borderColor: 'border-rose-200 dark:border-rose-800',
    hoverBg: 'hover:bg-rose-600',
    stats: { pharmacies: '500', branches: '1.2K', uptime: '99.9%' }
  },
  {
    id: 'meteo',
    name: 'HDM METEO',
    description: 'Weather intelligence platform',
    icon: HiCloud,
    bgGradient: 'from-teal-500 to-cyan-600',
    bgLight: 'bg-teal-50 dark:bg-teal-950',
    textColor: 'text-teal-600 dark:text-teal-400',
    borderColor: 'border-teal-200 dark:border-teal-800',
    hoverBg: 'hover:bg-teal-600',
    stats: { cities: '12K', forecasts: '1.4M', uptime: '99.9%' }
  },
  {
    id: 'tvetgrid',
    name: 'TVETGrid',
    description: 'TVET learning platform',
    icon: HiAcademicCap,
    bgGradient: 'from-indigo-500 to-blue-600',
    bgLight: 'bg-indigo-50 dark:bg-indigo-950',
    textColor: 'text-indigo-600 dark:text-indigo-400',
    borderColor: 'border-indigo-200 dark:border-indigo-800',
    hoverBg: 'hover:bg-indigo-600',
    stats: { courses: '85', learners: '12K', uptime: '99.9%' }
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
  },
  {
    id: 'rvnp',
    name: 'RVNP Hub',
    description: 'Campus community & digital quad',
    icon: HiAcademicCap,
    bgGradient: 'from-emerald-500 to-green-600',
    bgLight: 'bg-emerald-50 dark:bg-emerald-950',
    textColor: 'text-emerald-600 dark:text-emerald-400',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    hoverBg: 'hover:bg-emerald-600',
    stats: { users: '1,250', posts: '4.5K', groups: '28' }
  },
  {
    id: 'eduprime',
    name: 'EduPrime',
    description: 'School management & administration',
    icon: HiAcademicCap,
    bgGradient: 'from-amber-500 to-orange-600',
    bgLight: 'bg-amber-50 dark:bg-amber-950',
    textColor: 'text-amber-600 dark:text-amber-400',
    borderColor: 'border-amber-200 dark:border-amber-800',
    hoverBg: 'hover:bg-amber-600',
    stats: { schools: '45', students: '12K', teachers: '890' }
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