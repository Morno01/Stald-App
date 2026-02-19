import { useState, useEffect } from 'react'
import {
  collection, getDocs, addDoc, serverTimestamp, orderBy, query,
} from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../contexts/AuthContext'
import HorseCard from '../components/HorseCard'
import Toast, { useToast } from '../components/Toast'
import { Search, Plus, X, Loader2 } from 'lucide-react'

const EMPTY_HORSE = {
  name: '',
  ownerName: '',
  box: '',
  feed: '',
  notes: '',
  fieldId: '',
}

const FIELD_OPTIONS = [
  { id: '', label: 'Ingen (kun stald)' },
  { id: 'fold1', label: 'Fold 1' },
  { id: 'fold2', label: 'Fold 2' },
  { id: 'fold3', label: 'Fold 3' },
  { id: 'fold4', label: 'Fold 4' },
  { id: 'fold5', label: 'Fold 5' },
  { id: 'fold6', label: 'Fold 6' },
]

export default function Home() {
  const { currentUser } = useAuth()
  const [horses, setHorses] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState(EMPTY_HORSE)
  const [saving, setSaving] = useState(false)
  const { toast, showToast, hideToast } = useToast()

  async function fetchHorses() {
    setLoading(true)
    try {
      const q = query(collection(db, 'horses'), orderBy('name'))
      const snap = await getDocs(q)
      setHorses(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    } catch {
      showToast('Kunne ikke hente heste. Tjek din Firebase-konfiguration.', 'error')
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchHorses()
  }, [])

  async function handleCreate(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.ownerName.trim()) return
    setSaving(true)
    try {
      await addDoc(collection(db, 'horses'), {
        ...form,
        name: form.name.trim(),
        ownerName: form.ownerName.trim(),
        box: form.box.trim(),
        feed: form.feed.trim(),
        notes: form.notes.trim(),
        createdAt: serverTimestamp(),
        createdBy: currentUser.uid,
        createdByName: currentUser.displayName || currentUser.email,
      })
      setForm(EMPTY_HORSE)
      setShowCreate(false)
      showToast('Hest oprettet!')
      fetchHorses()
    } catch {
      showToast('Der opstod en fejl. Prøv igen.', 'error')
    }
    setSaving(false)
  }

  const filtered = horses.filter((h) => {
    const q = search.toLowerCase()
    return (
      h.name?.toLowerCase().includes(q) ||
      h.ownerName?.toLowerCase().includes(q) ||
      h.box?.toLowerCase().includes(q) ||
      h.feed?.toLowerCase().includes(q) ||
      h.notes?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-serif font-semibold text-stone-800">Vores heste</h1>
          <p className="text-stone-500 text-sm mt-1">
            {horses.length} {horses.length === 1 ? 'hest' : 'heste'} i stalden
          </p>
        </div>
        {currentUser && (
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="btn-primary"
          >
            <Plus size={16} />
            Opret ny hest
          </button>
        )}
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="card mb-8 border-brand-200">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-serif font-semibold text-stone-800">Ny hest</h2>
            <button
              onClick={() => { setShowCreate(false); setForm(EMPTY_HORSE) }}
              className="p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg"
            >
              <X size={16} />
            </button>
          </div>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Hestens navn *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-field"
                  placeholder="F.eks. Bella"
                />
              </div>
              <div>
                <label className="label">Ejers navn *</label>
                <input
                  type="text"
                  required
                  value={form.ownerName}
                  onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                  className="input-field"
                  placeholder="F.eks. Sara Hansen"
                />
              </div>
              <div>
                <label className="label">Boks</label>
                <input
                  type="text"
                  value={form.box}
                  onChange={(e) => setForm({ ...form, box: e.target.value })}
                  className="input-field"
                  placeholder="F.eks. 2 TV"
                />
              </div>
              <div>
                <label className="label">Fold</label>
                <select
                  value={form.fieldId}
                  onChange={(e) => setForm({ ...form, fieldId: e.target.value })}
                  className="input-field"
                >
                  {FIELD_OPTIONS.map((o) => (
                    <option key={o.id} value={o.id}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="label">Foder</label>
              <textarea
                value={form.feed}
                onChange={(e) => setForm({ ...form, feed: e.target.value })}
                className="input-field resize-y"
                rows={2}
                placeholder="F.eks. 2 kg havre morgen og aften, 1 håndfuld tilskud"
              />
            </div>
            <div>
              <label className="label">Noter</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="input-field resize-y"
                rows={2}
                placeholder="F.eks. Dyrlægebesøg 2/12, skobehandling næste uge"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button type="submit" disabled={saving} className="btn-primary">
                {saving && (
                  <Loader2 size={15} className="animate-spin" />
                )}
                {saving ? 'Gemmer...' : 'Gem hest'}
              </button>
              <button
                type="button"
                onClick={() => { setShowCreate(false); setForm(EMPTY_HORSE) }}
                className="btn-secondary"
              >
                Annuller
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-9"
          placeholder="Søg efter hest, ejer, foder, noter..."
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-stone-400">
          <Loader2 size={28} className="animate-spin mr-2" />
          <span>Henter heste...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🐴</div>
          {search ? (
            <>
              <p className="text-stone-500 text-lg font-serif">Ingen heste matcher din søgning</p>
              <p className="text-stone-400 text-sm mt-1">Prøv et andet søgeord</p>
            </>
          ) : (
            <>
              <p className="text-stone-500 text-lg font-serif">Ingen heste endnu</p>
              {currentUser ? (
                <p className="text-stone-400 text-sm mt-1">Tryk "Opret ny hest" for at komme i gang</p>
              ) : (
                <p className="text-stone-400 text-sm mt-1">Log ind for at oprette heste</p>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((horse) => (
            <HorseCard key={horse.id} horse={horse} />
          ))}
        </div>
      )}

      <Toast toast={toast} onClose={hideToast} />
    </div>
  )
}
