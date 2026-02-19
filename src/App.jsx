import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import HorsePage from './pages/HorsePage'
import Bulletin from './pages/Bulletin'
import FeedingSchedule from './pages/FeedingSchedule'
import Login from './pages/Login'
import Register from './pages/Register'

export default function App() {
  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <main className="page-enter">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/hest/:id" element={<HorsePage />} />
          <Route path="/opslagstavle" element={<Bulletin />} />
          <Route path="/foderplan" element={<FeedingSchedule />} />
          <Route path="/login" element={<Login />} />
          <Route path="/opret-bruger" element={<Register />} />
        </Routes>
      </main>
    </div>
  )
}
