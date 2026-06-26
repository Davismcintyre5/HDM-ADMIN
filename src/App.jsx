import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './shared/pages/LandingPage'
import ComingSoon from './shared/pages/ComingSoon'
import HDMERPApp from './apps/HDMERPApp'
import HDMAIApp from './apps/HDMAIApp'
import SmartPOSApp from './apps/SmartPOSApp'
import SparkApp from './apps/SparkApp'
import HDMVaultApp from './apps/HDMVaultApp'
import DocusoftApp from './apps/DocusoftApp'
import PortfolioApp from './apps/PortfolioApp'
import VibeApp from './apps/VibeApp'
import BizhubApp from './apps/BizhubApp'
import BridgeApp from './apps/BridgeApp'
import FlaxApp from './apps/FlaxApp'
import HDMNetApp from './apps/HDMNetApp'

const routerFuture = { v7_startTransition: true, v7_relativeSplatPath: true }

const systemConfig = {
  smartpos: true,
  hdmerp: true,
  hdmvault: true,
  hdmai: true,
  spark: true,
  docusoft: true,
  portfolio: true,
  vibe: true,
  bizhub: true,
  bridge: true,
  flax: true,
  hdmnet: true
}

function App() {
  return (
    <BrowserRouter future={routerFuture}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/smartpos/*" element={systemConfig.smartpos ? <SmartPOSApp /> : <ComingSoon />} />
        <Route path="/hdmerp/*" element={systemConfig.hdmerp ? <HDMERPApp /> : <ComingSoon />} />
        <Route path="/hdmvault/*" element={systemConfig.hdmvault ? <HDMVaultApp /> : <ComingSoon />} />
        <Route path="/hdmai/*" element={systemConfig.hdmai ? <HDMAIApp /> : <ComingSoon />} />
        <Route path="/spark/*" element={systemConfig.spark ? <SparkApp /> : <ComingSoon />} />
        <Route path="/docusoft/*" element={systemConfig.docusoft ? <DocusoftApp /> : <ComingSoon />} />
        <Route path="/portfolio/*" element={systemConfig.portfolio ? <PortfolioApp /> : <ComingSoon />} />
        <Route path="/vibe/*" element={systemConfig.vibe ? <VibeApp /> : <ComingSoon />} />
        <Route path="/bizhub/*" element={systemConfig.bizhub ? <BizhubApp /> : <ComingSoon />} />
        <Route path="/bridge/*" element={systemConfig.bridge ? <BridgeApp /> : <ComingSoon />} />
        <Route path="/flax/*" element={systemConfig.flax ? <FlaxApp /> : <ComingSoon />} />
        <Route path="/hdmnet/*" element={systemConfig.hdmnet ? <HDMNetApp /> : <ComingSoon />} />
        <Route path="*" element={<ComingSoon />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App