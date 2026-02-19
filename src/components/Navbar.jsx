import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  Home,
  ClipboardList,
  Calendar,
  User,
  LogOut,
  LogIn,
  Menu,
  X,
} from 'lucide-react'

const navItems = [
  { to: '/', label: 'Heste', icon: Home },
  { to: '/opslagstavle', label: 'Opslagstavle', icon: ClipboardList },
  { to: '/foderplan', label: 'Foderplan', icon: Calendar },
]

export default function Navbar() {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleLogout() {
    await logout()
    navigate('/login')
    setMenuOpen(false)
  }

  return (
    <header className="bg-white border-b border-rose-100 sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-serif text-xl font-semibold text-brand-600">
            <span className="text-2xl">🐴</span>
            <span>Stald App</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                    isActive
                      ? 'bg-brand-50 text-brand-600'
                      : 'text-stone-600 hover:bg-stone-100 hover:text-stone-800'
                  }`
                }
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Auth desktop */}
          <div className="hidden md:flex items-center gap-2">
            {currentUser ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-stone-500 flex items-center gap-1">
                  <User size={14} />
                  {currentUser.displayName || currentUser.email}
                </span>
                <button onClick={handleLogout} className="btn-secondary text-sm py-1.5">
                  <LogOut size={14} />
                  Log ud
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn-primary text-sm py-1.5">
                <LogIn size={14} />
                Log ind
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-stone-600 hover:bg-stone-100"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-stone-100 mt-0 pt-3 space-y-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-50 text-brand-600'
                      : 'text-stone-600 hover:bg-stone-100'
                  }`
                }
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
            <div className="pt-2 border-t border-stone-100">
              {currentUser ? (
                <>
                  <div className="px-3 py-2 text-sm text-stone-500 flex items-center gap-1">
                    <User size={14} />
                    {currentUser.displayName || currentUser.email}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <LogOut size={16} />
                    Log ud
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 text-sm text-brand-600 font-medium"
                >
                  <LogIn size={16} />
                  Log ind
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
