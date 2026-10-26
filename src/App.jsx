import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './shared/pages/LandingPage'
import ComingSoon from './shared/pages/ComingSoon'
import HDMAIApp from './apps/HDMAIApp'
import SmartPOSApp from './apps/SmartPOSApp'
import PharmaSysApp from './apps/PharmaSysApp'
import MeteoApp from './apps/MeteoApp'
import TvetGridApp from './apps/TvetGridApp'
import NexGuardApp from './apps/NexGuardApp'
import PortfolioApp from './apps/PortfolioApp'
import BizhubApp from './apps/BizhubApp'
import BridgeApp from './apps/BridgeApp'
import FlaxApp from './apps/FlaxApp'
import HDMNetApp from './apps/HDMNetApp'
import MarketBridgeApp from './apps/MarketBridgeApp'
import RVNPApp from './apps/RVNPApp'
import EduPrimeApp from './apps/EduPrimeApp'
import FarmVexaApp from './apps/FarmVexaApp'

const routerFuture = { v7_startTransition: true, v7_relativeSplatPath: true }

const systemConfig = {
  smartpos: true,
  pharmasys: true,
  meteo: true,
  tvetgrid: true,
  hdmai: true,
  nexguard: true,
  portfolio: true,
  bizhub: true,
  bridge: true,
  flax: true,
  hdmnet: true,
  farmvexa: true,
  marketbridge: true,
  rvnp: true,
  eduprime: true,
}

function App() {
  return (
    <BrowserRouter future={routerFuture}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/smartpos/*" element={systemConfig.smartpos ? <SmartPOSApp /> : <ComingSoon />} />
        <Route path="/pharmasys/*" element={systemConfig.pharmasys ? <PharmaSysApp /> : <ComingSoon />} />
        <Route path="/meteo/*" element={systemConfig.meteo ? <MeteoApp /> : <ComingSoon />} />
        <Route path="/tvetgrid/*" element={systemConfig.tvetgrid ? <TvetGridApp /> : <ComingSoon />} />
        <Route path="/hdmai/*" element={systemConfig.hdmai ? <HDMAIApp /> : <ComingSoon />} />
        <Route path="/nexguard/*" element={systemConfig.nexguard ? <NexGuardApp /> : <ComingSoon />} />
        <Route path="/portfolio/*" element={systemConfig.portfolio ? <PortfolioApp /> : <ComingSoon />} />
        <Route path="/bizhub/*" element={systemConfig.bizhub ? <BizhubApp /> : <ComingSoon />} />
        <Route path="/bridge/*" element={systemConfig.bridge ? <BridgeApp /> : <ComingSoon />} />
        <Route path="/flax/*" element={systemConfig.flax ? <FlaxApp /> : <ComingSoon />} />
        <Route path="/hdmnet/*" element={systemConfig.hdmnet ? <HDMNetApp /> : <ComingSoon />} />
        <Route path="/farmvexa/*" element={systemConfig.farmvexa ? <FarmVexaApp /> : <ComingSoon />} />
        <Route path="/marketbridge/*" element={systemConfig.marketbridge ? <MarketBridgeApp /> : <ComingSoon />} />
        <Route path="/rvnp/*" element={systemConfig.rvnp ? <RVNPApp /> : <ComingSoon />} />
        <Route path="/eduprime/*" element={systemConfig.eduprime ? <EduPrimeApp /> : <ComingSoon />} />
        <Route path="*" element={<ComingSoon />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App