import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppShell } from './layout/AppShell'
import { DashboardPage } from './pages/DashboardPage'
import { ExplorePage } from './pages/ExplorePage'
import { PlanPage } from './pages/PlanPage'
import { MyAdventuresPage } from './pages/MyAdventuresPage'
import { GuidePage } from './pages/GuidePage'
import { SiteDetailPage } from './pages/SiteDetailPage'
import { RegionDetailPage } from './pages/RegionDetailPage'

export default function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/plan" element={<PlanPage />} />
          <Route path="/my-adventures" element={<MyAdventuresPage />} />
          <Route path="/guide" element={<GuidePage />} />
          <Route path="/site/:kind/:id" element={<SiteDetailPage />} />
          <Route path="/region/:id" element={<RegionDetailPage />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  )
}
