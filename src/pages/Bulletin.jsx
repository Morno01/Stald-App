import { useState, useEffect } from 'react'
import {
  collection, addDoc, getDocs, orderBy, query, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../contexts/AuthContext'
import PostCard from '../components/PostCard'
import Toast, { useToast } from '../components/Toast'
import { Send, Pin, Loader2, ClipboardList } from 'lucide-react'

export default function Bulletin() {
  const { currentUser } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [newPost, setNewPost] = useState('')
  const [posting, setPosting] = useState(false)
  const { toast, showToast, hideToast } = useToast()

  async function fetchPosts() {
    setLoading(true)
    try {
      const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'))
      const snap = await getDocs(q)
      const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      // Pinned first, then by date
      const sorted = [
        ...all.filter((p) => p.pinned),
        ...all.filter((p) => !p.pinned),
      ]
      setPosts(sorted)
    } catch {
      showToast('Kunne ikke hente opslag.', 'error')
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  async function handlePost(e) {
    e.preventDefault()
    if (!newPost.trim()) return
    setPosting(true)
    try {
      await addDoc(collection(db, 'posts'), {
        content: newPost.trim(),
        authorId: currentUser.uid,
        authorName: currentUser.displayName || currentUser.email,
        pinned: false,
        createdAt: serverTimestamp(),
      })
      setNewPost('')
      showToast('Opslag oprettet!')
      fetchPosts()
    } catch {
      showToast('Fejl ved oprettelse af opslag.', 'error')
    }
    setPosting(false)
  }

  const pinnedPosts = posts.filter((p) => p.pinned)
  const regularPosts = posts.filter((p) => !p.pinned)

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <ClipboardList size={22} className="text-brand-500" />
          <h1 className="text-3xl font-serif font-semibold text-stone-800">Opslagstavle</h1>
        </div>
        <p className="text-stone-500 text-sm">Stævner, arrangementer og vigtige beskeder til stalden</p>
      </div>

      {/* New post form */}
      {currentUser ? (
        <div className="card mb-8 border-brand-100">
          <p className="text-sm text-stone-500 mb-3">
            Skriver som <span className="font-medium text-stone-700">{currentUser.displayName || currentUser.email}</span>
          </p>
          <form onSubmit={handlePost} className="space-y-3">
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              className="input-field resize-y min-h-[80px]"
              placeholder="Skriv et opslag... F.eks. Der er kage på tirsdag! 🎂"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={posting || !newPost.trim()}
                className="btn-primary"
              >
                {posting ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Send size={15} />
                )}
                {posting ? 'Sender...' : 'Post opslag'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="card mb-8 bg-stone-50 border-dashed text-center py-5">
          <p className="text-stone-500 text-sm">
            <a href="/login" className="text-brand-600 font-medium hover:underline">Log ind</a>
            {' '}for at skrive opslag
          </p>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-stone-400">
          <Loader2 size={24} className="animate-spin mr-2" />
          <span>Henter opslag...</span>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-stone-500 font-serif text-lg">Ingen opslag endnu</p>
          <p className="text-stone-400 text-sm mt-1">Vær den første til at skrive noget</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Pinned section */}
          {pinnedPosts.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-500 uppercase tracking-wide mb-3">
                <Pin size={12} className="fill-brand-300" />
                Fastgjorte opslag
              </div>
              <div className="space-y-3">
                {pinnedPosts.map((post) => (
                  <PostCard key={post.id} post={post} onChanged={fetchPosts} />
                ))}
              </div>
            </div>
          )}

          {/* Regular posts */}
          {regularPosts.length > 0 && (
            <div>
              {pinnedPosts.length > 0 && (
                <div className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-3 mt-6">
                  Alle opslag
                </div>
              )}
              <div className="space-y-3">
                {regularPosts.map((post) => (
                  <PostCard key={post.id} post={post} onChanged={fetchPosts} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <Toast toast={toast} onClose={hideToast} />
    </div>
  )
}
