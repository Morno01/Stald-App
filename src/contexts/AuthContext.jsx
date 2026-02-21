import { createContext, useContext, useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  browserLocalPersistence,
  browserSessionPersistence,
  setPersistence,
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase/config'

const AuthContext = createContext(null)

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  async function register(email, password, displayName) {
    const { user } = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(user, { displayName })
    await setDoc(doc(db, 'users', user.uid), {
      displayName,
      email,
      createdAt: serverTimestamp(),
    })
    return user
  }

  async function login(email, password, rememberMe = true) {
    const persistence = rememberMe
      ? browserLocalPersistence
      : browserSessionPersistence
    await setPersistence(auth, persistence)
    return signInWithEmailAndPassword(auth, email, password)
  }

  function logout() {
    return signOut(auth)
  }

  async function fetchUserProfile(uid) {
    const snap = await getDoc(doc(db, 'users', uid))
    if (snap.exists()) {
      setUserProfile({ id: snap.id, ...snap.data() })
    }
  }

  useEffect(() => {
    let unsubscribe = () => {}

    // Safety timeout — show the app within 4 seconds no matter what
    const timeout = setTimeout(() => setLoading(false), 4000)

    try {
      unsubscribe = onAuthStateChanged(
        auth,
        async (user) => {
          clearTimeout(timeout)
          setCurrentUser(user)
          if (user) {
            await fetchUserProfile(user.uid).catch(() => {})
          } else {
            setUserProfile(null)
          }
          setLoading(false)
        },
        (error) => {
          clearTimeout(timeout)
          console.error('Auth error:', error)
          setLoading(false)
        }
      )
    } catch (error) {
      clearTimeout(timeout)
      console.error('Firebase init error:', error)
      setLoading(false)
    }

    return () => {
      clearTimeout(timeout)
      unsubscribe()
    }
  }, [])

  const value = {
    currentUser,
    userProfile,
    loading,
    register,
    login,
    logout,
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-stone-400">
          <span className="text-4xl animate-bounce">🐴</span>
          <span className="text-sm">Indlæser...</span>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
