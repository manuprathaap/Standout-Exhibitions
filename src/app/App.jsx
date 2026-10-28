import { Route, Routes } from 'react-router-dom'
import AdminPage from '../features/editor/AdminPage.jsx'
import PortfolioPage from '../features/viewer/PortfolioPage.jsx'
import NotFoundPage from '../features/viewer/NotFoundPage.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/admin/*" element={<AdminPage />} />
      <Route path="/portfolio/:slug" element={<PortfolioPage />} />
      <Route path="/" element={<PortfolioPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
