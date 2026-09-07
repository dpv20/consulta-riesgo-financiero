import { Route, Routes } from 'react-router-dom'
import { HomePage } from '@/pages/HomePage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="*" element={<p className="p-8">404 — página no encontrada</p>} />
    </Routes>
  )
}
