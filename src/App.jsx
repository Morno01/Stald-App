import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import HorsePage from './pages/HorsePage'
import Bulletin from './pages/Bulletin'
import FeedingSchedule from './pages/FeedingSchedule'
import Login from './pages/Login'
import Register from './pages/Register'
import { isFirebaseConfigured } from './firebase/config'

function SetupScreen() {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-soft border border-stone-100 p-8">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🐴</div>
          <h1 className="text-2xl font-serif font-semibold text-stone-800">Stald App – Opsætning</h1>
          <p className="text-stone-500 text-sm mt-2">Firebase er ikke konfigureret endnu</p>
        </div>

        <div className="space-y-5 text-sm text-stone-700">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="font-semibold text-amber-800 mb-1">Hvad skal du gøre?</p>
            <p className="text-amber-700">Du mangler en <code className="bg-amber-100 px-1 rounded">.env</code>-fil med dine Firebase-nøgler i projektmappen.</p>
          </div>

          <div>
            <p className="font-semibold text-stone-800 mb-2">Trin 1 – Opret Firebase-projekt</p>
            <ol className="list-decimal list-inside space-y-1 text-stone-600">
              <li>Gå til <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="text-brand-600 underline">console.firebase.google.com</a></li>
              <li>Opret nyt projekt</li>
              <li>Aktiver <strong>Authentication</strong> → E-mail/adgangskode</li>
              <li>Opret <strong>Firestore Database</strong> (test-mode)</li>
              <li>Gå til Projektindstillinger → Tilføj webapp → Kopiér config</li>
            </ol>
          </div>

          <div>
            <p className="font-semibold text-stone-800 mb-2">Trin 2 – Opret <code className="bg-stone-100 px-1 rounded">.env</code>-fil</p>
            <p className="text-stone-600 mb-2">Opret filen <code className="bg-stone-100 px-1 rounded">.env</code> i projektmappen (samme mappe som <code className="bg-stone-100 px-1 rounded">package.json</code>) med dit indhold fra Firebase:</p>
            <pre className="bg-stone-800 text-green-400 rounded-lg p-3 text-xs overflow-x-auto leading-relaxed">
{`VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=dit-projekt.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=dit-projekt-id
VITE_FIREBASE_STORAGE_BUCKET=dit-projekt.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123:web:abc`}
            </pre>
          </div>

          <div>
            <p className="font-semibold text-stone-800 mb-2">Trin 3 – Genstart serveren</p>
            <pre className="bg-stone-800 text-green-400 rounded-lg p-3 text-xs">
{`# Stop serveren (Ctrl+C), derefter:
npm run dev`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  if (!isFirebaseConfigured) {
    return <SetupScreen />
  }

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
