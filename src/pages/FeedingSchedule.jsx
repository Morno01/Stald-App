import { useState, useEffect } from 'react'
import {
  collection, addDoc, getDocs, deleteDoc, doc, query,
  where, serverTimestamp, orderBy,
} from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../contexts/AuthContext'
import FieldMap from '../components/FieldMap'
import Toast, { useToast } from '../components/Toast'
import {
  ChevronLeft, ChevronRight, Calendar, Sun, Moon,
  UserPlus, UserMinus, Loader2, Users, MapPin,
} from 'lucide-react'

const DAYS_DA = ['Man', 'Tirs', 'Ons', 'Tors', 'Fre', 'Lør', 'Søn']
const DAYS_DA_FULL = ['Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag', 'Søndag']
const MONTHS_DA = [
  'Januar', 'Februar', 'Marts', 'April', 'Maj', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'December',
]

function getMonday(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = (day === 0 ? -6 : 1 - day)
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function addDays(date, n) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

function dateKey(date) {
  return date.toISOString().slice(0, 10)
}

function isToday(date) {
  return dateKey(date) === dateKey(new Date())
}

const USER_COLORS = [
  'bg-rose-100 text-rose-700 border-rose-200',
  'bg-violet-100 text-violet-700 border-violet-200',
  'bg-sky-100 text-sky-700 border-sky-200',
  'bg-amber-100 text-amber-700 border-amber-200',
  'bg-emerald-100 text-emerald-700 border-emerald-200',
  'bg-orange-100 text-orange-700 border-orange-200',
]

const colorMap = {}
let colorIdx = 0
function userColor(name) {
  if (!colorMap[name]) {
    colorMap[name] = USER_COLORS[colorIdx % USER_COLORS.length]
    colorIdx++
  }
  return colorMap[name]
}

function SlotCell({ slot, date, period, currentUser, onSignUp, onSignOff, loading }) {
  const isMe = slot?.userId === currentUser?.uid
  const dk = dateKey(date)
  const today = dateKey(new Date())
  const isPast = dk < today

  return (
    <div className={`min-h-[56px] rounded-lg border text-xs flex flex-col justify-center p-1.5 transition-all ${
      slot
        ? `${userColor(slot.userName)} border`
        : isPast
          ? 'bg-stone-50 border-stone-100 text-stone-300'
          : 'bg-white border-stone-200 border-dashed'
    }`}>
      {slot ? (
        <div className="text-center">
          <div className="font-semibold truncate">{slot.userName}</div>
          {isMe && !isPast && (
            <button
              onClick={() => onSignOff(slot.id)}
              disabled={loading}
              className="mt-1 flex items-center gap-0.5 mx-auto text-current opacity-60 hover:opacity-100"
            >
              <UserMinus size={10} />
              <span>Meld af</span>
            </button>
          )}
        </div>
      ) : !isPast && currentUser ? (
        <button
          onClick={() => onSignUp(dk, period)}
          disabled={loading}
          className="flex flex-col items-center gap-0.5 text-stone-400 hover:text-brand-500 w-full h-full justify-center transition-colors"
        >
          <UserPlus size={14} />
          <span className="text-[10px]">Meld dig</span>
        </button>
      ) : (
        <div className="text-center text-stone-300 text-[10px]">{isPast ? '—' : 'Ledig'}</div>
      )}
    </div>
  )
}

export default function FeedingSchedule() {
  const { currentUser } = useAuth()
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()))
  const [slots, setSlots] = useState([])
  const [horses, setHorses] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const { toast, showToast, hideToast } = useToast()

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const weekEnd = addDays(weekStart, 6)

  async function fetchData() {
    setLoadingSlots(true)
    try {
      const [slotsSnap, horsesSnap] = await Promise.all([
        getDocs(
          query(
            collection(db, 'feedingSchedule'),
            where('date', '>=', dateKey(weekStart)),
            where('date', '<=', dateKey(weekEnd)),
          )
        ),
        getDocs(query(collection(db, 'horses'), orderBy('name'))),
      ])
      setSlots(slotsSnap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setHorses(horsesSnap.docs.map((d) => ({ id: d.id, ...d.data() })))
    } catch {
      showToast('Fejl ved hentning af foderplan.', 'error')
    }
    setLoadingSlots(false)
  }

  useEffect(() => {
    fetchData()
  }, [weekStart])

  async function handleSignUp(date, period) {
    if (!currentUser) return
    // Check not already signed up for this slot
    const existing = slots.find((s) => s.date === date && s.period === period)
    if (existing) return showToast('Nogen har allerede meldt sig til dette tidspunkt.', 'error')
    setActionLoading(true)
    try {
      await addDoc(collection(db, 'feedingSchedule'), {
        date,
        period,
        userId: currentUser.uid,
        userName: currentUser.displayName || currentUser.email,
        createdAt: serverTimestamp(),
      })
      showToast('Du er tilmeldt!')
      fetchData()
    } catch {
      showToast('Fejl. Prøv igen.', 'error')
    }
    setActionLoading(false)
  }

  async function handleSignOff(slotId) {
    setActionLoading(true)
    try {
      await deleteDoc(doc(db, 'feedingSchedule', slotId))
      showToast('Du er afmeldt.')
      fetchData()
    } catch {
      showToast('Fejl. Prøv igen.', 'error')
    }
    setActionLoading(false)
  }

  function getSlot(date, period) {
    return slots.find((s) => s.date === dateKey(date) && s.period === period) || null
  }

  // My upcoming slots
  const mySlots = slots
    .filter((s) => s.userId === currentUser?.uid && s.date >= dateKey(new Date()))
    .sort((a, b) => a.date.localeCompare(b.date))

  const fieldHorses = horses.filter((h) => h.fieldId)

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Calendar size={22} className="text-brand-500" />
            <h1 className="text-3xl font-serif font-semibold text-stone-800">Foderplan</h1>
          </div>
          <p className="text-stone-500 text-sm">Hvem fodrer hestene i foldene?</p>
        </div>

        {/* Week navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekStart(addDays(weekStart, -7))}
            className="btn-secondary p-2"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="text-sm font-medium text-stone-700 px-1 text-center min-w-[160px]">
            {weekStart.getDate()}. {MONTHS_DA[weekStart.getMonth()].toLowerCase()}
            {' – '}
            {weekEnd.getDate()}. {MONTHS_DA[weekEnd.getMonth()].toLowerCase()}
            {' '}
            {weekEnd.getFullYear()}
          </div>
          <button
            onClick={() => setWeekStart(addDays(weekStart, 7))}
            className="btn-secondary p-2"
          >
            <ChevronRight size={16} />
          </button>
          <button
            onClick={() => setWeekStart(getMonday(new Date()))}
            className="btn-secondary text-xs px-3 py-2"
          >
            I dag
          </button>
        </div>
      </div>

      {/* Info box */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-800">
        <strong>Sådan fungerer det:</strong> Meld dig til morgen- og aftenfodringsrunderne for hestene i foldene.
        Klik på et tomt felt for at tilmelde dig. Du kan kun melde dig af dine egne vagter.
        {!currentUser && <span className="block mt-1">Du skal <a href="/login" className="font-medium underline">logge ind</a> for at tilmelde dig.</span>}
      </div>

      {/* Schedule grid */}
      {loadingSlots ? (
        <div className="flex items-center justify-center py-16 text-stone-400">
          <Loader2 size={24} className="animate-spin mr-2" />
          Henter foderplan...
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[520px]">
            <thead>
              <tr>
                <th className="w-20 text-left text-xs text-stone-400 font-medium pb-3 pr-2">Tid</th>
                {weekDays.map((d, i) => (
                  <th
                    key={i}
                    className={`text-center text-xs font-medium pb-3 px-1 ${
                      isToday(d) ? 'text-brand-600' : 'text-stone-500'
                    }`}
                  >
                    <div className={`inline-flex flex-col items-center ${isToday(d) ? 'bg-brand-50 rounded-lg px-2 py-1' : ''}`}>
                      <span>{DAYS_DA[i]}</span>
                      <span className={`text-base font-semibold ${isToday(d) ? 'text-brand-600' : 'text-stone-700'}`}>
                        {d.getDate()}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Morning row */}
              <tr>
                <td className="pr-2 pb-2">
                  <div className="flex items-center gap-1 text-xs text-stone-500 font-medium">
                    <Sun size={12} className="text-amber-400" />
                    Morgen
                  </div>
                </td>
                {weekDays.map((d, i) => (
                  <td key={i} className="pb-2 px-1">
                    <SlotCell
                      slot={getSlot(d, 'morning')}
                      date={d}
                      period="morning"
                      currentUser={currentUser}
                      onSignUp={handleSignUp}
                      onSignOff={handleSignOff}
                      loading={actionLoading}
                    />
                  </td>
                ))}
              </tr>

              {/* Evening row */}
              <tr>
                <td className="pr-2">
                  <div className="flex items-center gap-1 text-xs text-stone-500 font-medium">
                    <Moon size={12} className="text-indigo-400" />
                    Aften
                  </div>
                </td>
                {weekDays.map((d, i) => (
                  <td key={i} className="px-1">
                    <SlotCell
                      slot={getSlot(d, 'evening')}
                      date={d}
                      period="evening"
                      currentUser={currentUser}
                      onSignUp={handleSignUp}
                      onSignOff={handleSignOff}
                      loading={actionLoading}
                    />
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* My upcoming slots */}
      {currentUser && mySlots.length > 0 && (
        <div className="card mt-6">
          <div className="flex items-center gap-2 mb-4">
            <Users size={16} className="text-brand-500" />
            <h2 className="font-serif font-semibold text-stone-800">Dine kommende vagter</h2>
          </div>
          <div className="space-y-2">
            {mySlots.map((s) => {
              const date = new Date(s.date + 'T12:00:00')
              return (
                <div
                  key={s.id}
                  className="flex items-center justify-between text-sm bg-brand-50 rounded-lg px-3 py-2 border border-brand-100"
                >
                  <div className="flex items-center gap-2">
                    {s.period === 'morning' ? (
                      <Sun size={14} className="text-amber-400" />
                    ) : (
                      <Moon size={14} className="text-indigo-400" />
                    )}
                    <span className="text-stone-700 font-medium">
                      {DAYS_DA_FULL[date.getDay() === 0 ? 6 : date.getDay() - 1]}{' '}
                      {date.getDate()}. {MONTHS_DA[date.getMonth()]}
                    </span>
                    <span className="text-stone-500">
                      {s.period === 'morning' ? '– morgen' : '– aften'}
                    </span>
                  </div>
                  <button
                    onClick={() => handleSignOff(s.id)}
                    className="text-stone-400 hover:text-red-500 transition-colors"
                  >
                    <UserMinus size={14} />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Field map */}
      <div className="card mt-6">
        <div className="flex items-center gap-2 mb-4">
          <MapPin size={16} className="text-brand-500" />
          <h2 className="font-serif font-semibold text-stone-800">Kort over folde</h2>
          <span className="text-xs text-stone-400 ml-1">
            ({fieldHorses.length} {fieldHorses.length === 1 ? 'hest' : 'heste'} ude)
          </span>
        </div>

        {fieldHorses.length === 0 ? (
          <div className="text-center py-8 text-stone-400">
            <div className="text-4xl mb-2">🗺️</div>
            <p className="text-sm">Ingen heste er tilknyttet en fold endnu.</p>
            <p className="text-xs mt-1">Tilknyt heste til folde under "Rediger hest"</p>
          </div>
        ) : (
          <FieldMap horses={horses} />
        )}
      </div>

      <Toast toast={toast} onClose={hideToast} />
    </div>
  )
}
