import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { UserPlus, Eye, EyeOff } from 'lucide-react'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ displayName: '', email: '', password: '', confirm: '' })
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) {
      return setError('Adgangskoderne stemmer ikke overens.')
    }
    if (form.password.length < 6) {
      return setError('Adgangskoden skal være mindst 6 tegn.')
    }
    setLoading(true)
    try {
      await register(form.email, form.password, form.displayName)
      navigate('/')
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Denne e-mail er allerede i brug.')
      } else {
        setError('Der opstod en fejl. Prøv igen.')
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🌸</div>
          <h1 className="text-3xl font-serif font-semibold text-stone-800">Opret bruger</h1>
          <p className="text-stone-500 mt-1 text-sm">Bliv en del af stalden</p>
        </div>

        <div className="card">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Dit navn</label>
              <input
                type="text"
                required
                value={form.displayName}
                onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                className="input-field"
                placeholder="Marie"
                autoComplete="name"
              />
            </div>

            <div>
              <label className="label">E-mail</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-field"
                placeholder="din@email.dk"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="label">Adgangskode</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-field pr-10"
                  placeholder="Min. 6 tegn"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="label">Bekræft adgangskode</label>
              <input
                type={showPw ? 'text' : 'password'}
                required
                value={form.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                className="input-field"
                placeholder="Gentag adgangskoden"
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-2.5"
            >
              {loading ? (
                <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <UserPlus size={16} />
              )}
              {loading ? 'Opretter...' : 'Opret bruger'}
            </button>
          </form>
        </div>

        <p className="text-center mt-4 text-sm text-stone-500">
          Har du allerede en konto?{' '}
          <Link to="/login" className="text-brand-600 hover:underline font-medium">
            Log ind
          </Link>
        </p>
      </div>
    </div>
  )
}
