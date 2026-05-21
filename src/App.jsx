import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './shared/pages/LandingPage'
import ComingSoon from './shared/pages/ComingSoon'
import HDMERPApp from './apps/HDMERPApp'
import HDMAIApp from './apps/HDMAIApp'

const routerFuture = { v7_startTransition: true, v7_relativeSplatPath: true }

const systemConfig = {
  smartpos: false,
  hdmerp: true,
  hdmvault: false,
  hdmai: true,
  spark: false,
  vibe: false
}

function App() {
  return (
    <BrowserRouter future={routerFuture}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/smartpos/*" element={systemConfig.smartpos ? <ComingSoon /> : <ComingSoon />} />
        <Route path="/hdmerp/*" element={systemConfig.hdmerp ? <HDMERPApp /> : <ComingSoon />} />
        <Route path="/hdmvault/*" element={<ComingSoon />} />
        <Route path="/hdmai/*" element={systemConfig.hdmai ? <HDMAIApp /> : <ComingSoon />} />
        <Route path="/spark/*" element={systemConfig.spark ? <ComingSoon /> : <ComingSoon />} />
        <Route path="/vibe/*" element={<ComingSoon />} />
        <Route path="*" element={<ComingSoon />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App