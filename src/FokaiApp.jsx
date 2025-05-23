import { useEffect, useState } from 'react'
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth"

const provider = new GoogleAuthProvider()

export default function FokaiApp() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const auth = getAuth()
    auth.onAuthStateChanged(u => setUser(u))
  }, [])

  function login() {
    const auth = getAuth()
    signInWithPopup(auth, provider)
  }

  function logout() {
    const auth = getAuth()
    signOut(auth)
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
