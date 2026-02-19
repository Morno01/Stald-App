import { useState } from 'react'
import { doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../contexts/AuthContext'
import { Pin, PinOff, Pencil, Trash2, Check, X, Clock } from 'lucide-react'

function timeAgo(ts) {
  if (!ts) return ''
  const date = ts.toDate ? ts.toDate() : new Date(ts)
  const diff = (Date.now() - date) / 1000
  if (diff < 60) return 'lige nu'
  if (diff < 3600) return `${Math.floor(diff / 60)} min. siden`
  if (diff < 86400) return `${Math.floor(diff / 3600)} t. siden`
  return date.toLocaleDateString('da-DK', { day: 'numeric', month: 'short' })
}

export default function PostCard({ post, onChanged }) {
  const { currentUser } = useAuth()
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(post.content)
  const [saving, setSaving] = useState(false)

  const ref = doc(db, 'posts', post.id)

  async function handlePin() {
    await updateDoc(ref, { pinned: !post.pinned })
    onChanged()
  }

  async function handleDelete() {
    if (!window.confirm('Er du sikker på, at du vil slette dette opslag?')) return
    await deleteDoc(ref)
    onChanged()
  }

  async function handleSave() {
    if (!editText.trim()) return
    setSaving(true)
    await updateDoc(ref, {
      content: editText.trim(),
      updatedAt: serverTimestamp(),
    })
    setSaving(false)
    setEditing(false)
    onChanged()
  }

  return (
    <div className={`card relative ${post.pinned ? 'border-brand-200 bg-brand-50/30' : ''}`}>
      {post.pinned && (
        <div className="absolute top-3 right-3">
          <Pin size={14} className="text-brand-400 fill-brand-200" />
        </div>
      )}

      {editing ? (
        <div className="space-y-3">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="input-field min-h-[80px] resize-y text-sm"
            autoFocus
          />
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary text-sm py-1.5"
            >
              <Check size={14} />
              Gem
            </button>
            <button onClick={() => setEditing(false)} className="btn-secondary text-sm py-1.5">
              <X size={14} />
              Annuller
            </button>
            {post.pinned && (
              <button
                onClick={async () => {
                  await updateDoc(ref, { pinned: false })
                  setEditing(false)
                  onChanged()
                }}
                className="btn-secondary text-sm py-1.5 text-stone-500"
              >
                <PinOff size={14} />
                Fjern pin
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          <p className="text-stone-700 text-sm leading-relaxed whitespace-pre-wrap pr-5">
            {post.content}
          </p>

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-stone-100">
            <div className="flex items-center gap-3 text-xs text-stone-400">
              <span className="font-medium text-stone-500">{post.authorName || 'Ukendt'}</span>
              <span className="flex items-center gap-1">
                <Clock size={11} />
                {timeAgo(post.createdAt)}
              </span>
              {post.updatedAt && (
                <span className="italic">(redigeret)</span>
              )}
            </div>

            {currentUser && (
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePin}
                  title={post.pinned ? 'Fjern pin' : 'Pin opslag'}
                  className="p-1.5 text-stone-400 hover:text-brand-500 hover:bg-brand-50 rounded-lg transition-colors"
                >
                  {post.pinned ? <PinOff size={14} /> : <Pin size={14} />}
                </button>
                <button
                  onClick={() => { setEditText(post.content); setEditing(true) }}
                  className="p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
