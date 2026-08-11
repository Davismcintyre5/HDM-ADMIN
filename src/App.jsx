import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './shared/pages/LandingPage'
import ComingSoon from './shared/pages/ComingSoon'
import HDMERPApp from './apps/HDMERPApp'
import HDMAIApp from './apps/HDMAIApp'
import SmartPOSApp from './apps/SmartPOSApp'
import SparkApp from './apps/SparkApp'
import NexGuardApp from './apps/NexGuardApp'
import DocusoftApp from './apps/DocusoftApp'
import PortfolioApp from './apps/PortfolioApp'
import BizhubApp from './apps/BizhubApp'
import BridgeApp from './apps/BridgeApp'
import FlaxApp from './apps/FlaxApp'
import HDMNetApp from './apps/HDMNetApp'
import FarmWiseApp from './apps/FarmWiseApp'
import MarketBridgeApp from './apps/MarketBridgeApp'
import RVNPApp from './apps/RVNPApp'
import EduPrimeApp from './apps/EduPrimeApp'
import HDMAI2App from './apps/HDMAI2App'
import FarmVexaApp from './apps/FarmVexaApp'

const routerFuture = { v7_startTransition: true, v7_relativeSplatPath: true }

const systemConfig = {
  smartpos: true,
  hdmerp: true,
  hdmai: true,
  nexguard: true,
  spark: true,
  docusoft: true,
  portfolio: true,
  vibe: false,
  bizhub: true,
  bridge: true,
  flax: true,
  hdmnet: true,
  farmwise: true,
  farmvexa: true,
  marketbridge: true,
  rvnp: true,
  eduprime: true,
  hdmai2: true
}

function App() {
  return (
    <BrowserRouter future={routerFuture}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/smartpos/*" element={systemConfig.smartpos ? <SmartPOSApp /> : <ComingSoon />} />
        <Route path="/hdmerp/*" element={systemConfig.hdmerp ? <HDMERPApp /> : <ComingSoon />} />
        <Route path="/hdmai/*" element={systemConfig.hdmai ? <HDMAIApp /> : <ComingSoon />} />
        <Route path="/nexguard/*" element={systemConfig.nexguard ? <NexGuardApp /> : <ComingSoon />} />
        <Route path="/spark/*" element={systemConfig.spark ? <SparkApp /> : <ComingSoon />} />
        <Route path="/docusoft/*" element={systemConfig.docusoft ? <DocusoftApp /> : <ComingSoon />} />
        <Route path="/portfolio/*" element={systemConfig.portfolio ? <PortfolioApp /> : <ComingSoon />} />
        <Route path="/vibe/*" element={<ComingSoon />} />
        <Route path="/bizhub/*" element={systemConfig.bizhub ? <BizhubApp /> : <ComingSoon />} />
        <Route path="/bridge/*" element={systemConfig.bridge ? <BridgeApp /> : <ComingSoon />} />
        <Route path="/flax/*" element={systemConfig.flax ? <FlaxApp /> : <ComingSoon />} />
        <Route path="/hdmnet/*" element={systemConfig.hdmnet ? <HDMNetApp /> : <ComingSoon />} />
        <Route path="/farmwise/*" element={systemConfig.farmwise ? <FarmWiseApp /> : <ComingSoon />} />
        <Route path="/farmvexa/*" element={systemConfig.farmvexa ? <FarmVexaApp /> : <ComingSoon />} />
        <Route path="/marketbridge/*" element={systemConfig.marketbridge ? <MarketBridgeApp /> : <ComingSoon />} />
        <Route path="/rvnp/*" element={systemConfig.rvnp ? <RVNPApp /> : <ComingSoon />} />
        <Route path="/hdmai2/*" element={systemConfig.hdmai2 ? <HDMAI2App /> : <ComingSoon />} />
        <Route path="/eduprime/*" element={systemConfig.eduprime ? <EduPrimeApp /> : <ComingSoon />} />
        <Route path="*" element={<ComingSoon />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App