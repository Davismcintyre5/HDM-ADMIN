// src/shared/layouts/UnifiedLayout.jsx
import { Outlet } from 'react-router-dom'

export default function UnifiedLayout() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] transition-colors duration-200">
      <Outlet />
    </div>
  )
}