import { useEffect, useState } from 'react'
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth"
import { getFirestore, doc, setDoc, getDoc, serverTimestamp, addDoc, collection } from "firebase/firestore"
import app from './firebase'

const provider = new GoogleAuthProvider()
const auth = getAuth(app)
const db = getFirestore(app)

export default function FokaiApp() {
  const [user, setUser] = useState(null)
  const [sessionDate, setSessionDate] = useState('')
  const [sessionTime, setSessionTime] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      if (u) {
        setUser(u)
        const ref = doc(db, "users", u.uid)
        const snap = await getDoc(ref)
        if (!snap.exists()) {
          await setDoc(ref, {
            name: u.displayName,
            email: u.email,
            plan: "free",
            createdAt: serverTimestamp()
          })
        }
      } else {
        setUser(null)
      }
    })
    return () => unsubscribe()
  }, [])

  function login() {
    signInWithPopup(auth, provider)
  }

  function logout() {
    signOut(auth)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSuccessMessage('')
    try {
      const sessionRef = collection(db, "sessions")
      await addDoc(sessionRef, {
        uid: user.uid,
        date: sessionDate,
        time: sessionTime,
        createdAt: serverTimestamp()
      })
      setSuccessMessage('Sessão agendada com sucesso!')
      setSessionDate('')
      setSessionTime('')
    } catch (err) {
      alert('Erro ao agendar sessão')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center bg-white text-gray-900 space-y-6 p-4">
      <h1 className="text-5xl font-bold text-blue-400">Fokai</h1>
      {!user ? (
        <>
          <p>Conecte-se para agendar sessões com foco.</p>
          <button onClick={login} className="bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition">
            Entrar com Google
          </button>
        </>
      ) : (
        <>
          <p>Bem-vinda, {user.displayName}</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block">Data da sessão:</label>
              <input
                type="date"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                className="border px-2 py-1 rounded w-full"
                required
              />
            </div>
            <div>
              <label className="block">Horário:</label>
              <input
                type="time"
                value={sessionTime}
                onChange={(e) => setSessionTime(e.target.value)}
                className="border px-2 py-1 rounded w-full"
                required
              />
            </div>
            <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition">
              Agendar sessão
            </button>
            {successMessage && <p className="text-green-600 font-medium mt-2">{successMessage}</p>}
          </form>
          <button onClick={logout} className="text-blue-600 underline mt-4">Sair</button>
        </>
      )}
    </div>
  )
}
