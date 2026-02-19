import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { doc, getDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../contexts/AuthContext'
import QRCodeModal from '../components/QRCodeModal'
import Toast, { useToast } from '../components/Toast'
import {
  ArrowLeft, QrCode, Pencil, Trash2, Save, X, Loader2,
  User, MapPin, Utensils, StickyNote, Building2,
} from 'lucide-react'

const FIELD_OPTIONS = [
  { id: '', label: 'Ingen (kun stald)' },
  { id: 'fold1', label: 'Fold 1' },
  { id: 'fold2', label: 'Fold 2' },
  { id: 'fold3', label: 'Fold 3' },
  { id: 'fold4', label: 'Fold 4' },
  { id: 'fold5', label: 'Fold 5' },
  { id: 'fold6', label: 'Fold 6' },
]

function InfoRow({ icon: Icon, label, value, className = '' }) {
  if (!value) return null
  return (
    <div className={`flex gap-3 ${className}`}>
      <div className="mt-0.5 text-brand-400 shrink-0">
        <Icon size={16} />
      </div>
      <div>
        <div className="text-xs text-stone-400 font-medium uppercase tracking-wide mb-0.5">{label}</div>
        <div className="text-stone-700 text-sm leading-relaxed whitespace-pre-wrap">{value}</div>
      </div>
    </div>
  )
}

export default function HorsePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [horse, setHorse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showQR, setShowQR] = useState(false)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const { toast, showToast, hideToast } = useToast()

  async function fetchHorse() {
    setLoading(true)
    try {
      const snap = await getDoc(doc(db, 'horses', id))
      if (snap.exists()) {
        const data = { id: snap.id, ...snap.data() }
        setHorse(data)
        setForm({
          name: data.name || '',
          ownerName: data.ownerName || '',
          box: data.box || '',
          feed: data.feed || '',
          notes: data.notes || '',
          fieldId: data.fieldId || '',
        })
      } else {
        navigate('/')
      }
    } catch {
      showToast('Kunne ikke hente hest.', 'error')
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchHorse()
  }, [id])

  async function handleSave(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.ownerName.trim()) return
    setSaving(true)
    try {
      await updateDoc(doc(db, 'horses', id), {
        ...form,
        name: form.name.trim(),
        ownerName: form.ownerName.trim(),
        box: form.box.trim(),
        feed: form.feed.trim(),
        notes: form.notes.trim(),
        updatedAt: serverTimestamp(),
        updatedBy: currentUser.uid,
      })
      setEditing(false)
      showToast('Hest gemt!')
      fetchHorse()
    } catch {
      showToast('Fejl ved gemning. Prøv igen.', 'error')
    }
    setSaving(false)
  }

  async function handleDelete() {
    if (!window.confirm(`Er du sikker på at du vil slette ${horse.name}? Dette kan ikke fortrydes.`)) return
    try {
      await deleteDoc(doc(db, 'horses', id))
      navigate('/')
    } catch {
      showToast('Kunne ikke slette hest.', 'error')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-stone-400">
        <Loader2 size={28} className="animate-spin mr-2" />
        <span>Indlæser...</span>
      </div>
    )
  }

  if (!horse) return null

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Back */}
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700 mb-6 transition-colors">
        <ArrowLeft size={15} />
        Tilbage til alle heste
      </Link>

      {editing ? (
        /* ── Edit form ── */
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-serif font-semibold text-stone-800">Rediger hest</h1>
            <button
              onClick={() => { setEditing(false); setForm({ name: horse.name, ownerName: horse.ownerName, box: horse.box || '', feed: horse.feed || '', notes: horse.notes || '', fieldId: horse.fieldId || '' }) }}
              className="p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg"
            >
              <X size={16} />
            </button>
          </div>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Hestens navn *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-field"
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
                rows={3}
                placeholder="Beskriv hestens foderbehov..."
              />
            </div>
            <div>
              <label className="label">Noter</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="input-field resize-y"
                rows={3}
                placeholder="Dyrlæge, skobehandling, medicin..."
              />
            </div>
            <div className="flex flex-wrap gap-2 pt-2 border-t border-stone-100">
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                {saving ? 'Gemmer...' : 'Gem ændringer'}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="btn-secondary"
              >
                <X size={15} />
                Annuller
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="btn-danger ml-auto"
              >
                <Trash2 size={15} />
                Slet hest
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* ── View ── */
        <>
          <div className="card mb-4">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h1 className="text-3xl font-serif font-semibold text-stone-800">{horse.name}</h1>
                {horse.box && (
                  <span className="mt-1 inline-block bg-brand-50 text-brand-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-brand-100">
                    Boks {horse.box}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <InfoRow icon={User} label="Ejer" value={horse.ownerName} />
              <InfoRow icon={Building2} label="Boks" value={horse.box} />
              {horse.fieldId && (
                <InfoRow
                  icon={MapPin}
                  label="Fold"
                  value={FIELD_OPTIONS.find((f) => f.id === horse.fieldId)?.label}
                />
              )}
              <InfoRow icon={Utensils} label="Foder" value={horse.feed} />
              <InfoRow icon={StickyNote} label="Noter" value={horse.notes} />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            <button onClick={() => setShowQR(true)} className="btn-primary">
              <QrCode size={16} />
              Vis QR kode
            </button>
            {currentUser && (
              <button onClick={() => setEditing(true)} className="btn-secondary">
                <Pencil size={15} />
                Rediger hest
              </button>
            )}
          </div>
        </>
      )}

      {showQR && (
        <QRCodeModal horse={horse} onClose={() => setShowQR(false)} />
      )}

      <Toast toast={toast} onClose={hideToast} />
    </div>
  )
}
