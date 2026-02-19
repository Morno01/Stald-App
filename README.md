# 🐴 Stald App

En webapp til håndtering af heste, foderplan og opslagstavle i stalden.

## Tech Stack

- **React 18** + Vite
- **TailwindCSS** (elegant, stilrent design)
- **Firebase** (Firestore database + Authentication + Hosting)
- **React Router v6**
- **qrcode.react** (QR-kode generering)

---

## Opsætning

### 1. Opret Firebase-projekt

1. Gå til [console.firebase.google.com](https://console.firebase.google.com)
2. Opret et nyt projekt
3. Aktiver **Authentication** → E-mail/adgangskode
4. Opret en **Firestore Database** (start i test-mode)
5. Gå til **Projektindstillinger** → **Dine apps** → Tilføj webapp
6. Kopiér din Firebase-konfiguration

### 2. Konfigurer miljøvariabler

```bash
cp .env.example .env
```

Udfyld `.env` med din Firebase-konfiguration:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### 3. Installer og kør

```bash
npm install
npm run dev
```

Åbn `http://localhost:5173`

---

## Firebase Hosting (deploy)

```bash
npm install -g firebase-tools
firebase login
firebase init hosting   # vælg dit projekt, public: dist, SPA: ja
npm run build
firebase deploy
```

Opdater `.firebaserc` med dit projekt-ID.

---

## Sider & URL'er

| Side | URL | Beskrivelse |
|------|-----|-------------|
| Heste (forside) | `/` | Liste over alle heste med søgning |
| Heste-profil | `/hest/:id` | Enkelt hests side med QR-kode |
| Opslagstavle | `/opslagstavle` | Opslag, pinning, redigering |
| Foderplan | `/foderplan` | Ugentlig vagtplan + kortvisning |
| Log ind | `/login` | Login med e-mail/adgangskode |
| Opret bruger | `/opret-bruger` | Ny brugerkonto |

---

## Features

- **Heste**: Opret, rediger, slet heste med navn, ejer, boks, foder og noter
- **QR-kode**: Hver hest har sin egen QR-kode der kan printes eller downloades
- **Opslagstavle**: Opslag med pin-funktion, redigering og sletning
- **Foderplan**: Ugentlig kalender med morgen/aften-vagter til heste i folde
- **Foldkort**: SVG-kort der viser hvilke heste der er i hvilke folde
- **Auth**: Firebase Authentication med "Husk mig"-funktion

---

## Firestore Struktur

```
horses/{id}       – name, ownerName, box, feed, notes, fieldId
posts/{id}        – content, authorName, authorId, pinned, createdAt
feedingSchedule/{id} – date, period, userId, userName
users/{id}        – displayName, email, createdAt
```
