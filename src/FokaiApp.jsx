import { useEffect, useState } from 'react'
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth"
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore"
import app from './firebase'

const provider = new GoogleAuthProvider()
const auth = getAuth(app)
const db = getFirestore(app)

export default function FokaiApp() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      if (u) {
        setUser(u)
        try {
          const ref = doc(db, "users", u.uid)
          const snap = await getDoc(ref)
          if (!snap.exists()) {
            await setDoc(ref, {
              name: u.displayName || "",
              email: u.email || "",
              plan: "free",
              createdAt: serverTimestamp()
            })
          }
        } catch (err) {
          console.error("Erro ao salvar no Firestore:", err)
        }
      } else {
        setUser(null)
      }
    })
    return () => unsubscribe()
  }, [])

  function login() {
    signInWithPopup(auth, provider).catch(err => {
      console.error("Erro ao fazer login:", err)
    })
  }

  function logout() {
    signOut(auth).catch(err => {
      console.error("Erro ao sair:", err)
    })
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
          <button onClick={logout} className="text-blue-600 underline">Sair</button>
        </>
      )}
    </div>
  )
}
