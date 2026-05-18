import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { getToken, removeToken } from '../utils/auth'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: async () => {
    // Tightly secure page access: Not only check cookie presence, but actively validate it 
    // against the backend before loading the route component.
    if (typeof window !== 'undefined') {
      const token = getToken()
      if (!token) {
        throw redirect({
          to: '/auth',
        })
      }

      try {
        const res = await fetch('http://localhost:5000/auth/validate', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!res.ok) {
          removeToken()
          throw redirect({ to: '/auth' })
        }
      } catch (e: any) {
        if (e.message?.includes('redirect')) throw e
        removeToken()
        throw redirect({ to: '/auth' })
      }
    } else {
        // We aren't able to easily securely check client cookies natively inside TanStack simple SSR
        // but we can delay hydration or pass to browser tightly
    }
  },
  component: DashboardPage,
})

function DashboardPage() {
  const navigate = useNavigate()

  const handleLogout = () => {
    removeToken()
    navigate({ to: '/auth' })
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center">
      <nav className="w-full bg-white shadow-sm border-b border-slate-200 sticky top-0 z-10 px-6 py-4 flex justify-between items-center">
        <div className="font-bold text-xl text-indigo-600 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          SecureApp
        </div>
        <button
          onClick={handleLogout}
          className="text-sm font-medium text-slate-500 hover:text-red-600 transition-colors bg-slate-100 hover:bg-red-50 px-4 py-2 rounded-lg"
        >
          Sign Out
        </button>
      </nav>

      <main className="flex-1 w-full max-w-4xl p-6 sm:p-12">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 sm:p-12 text-center animate-fade-in-up">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Protected Dashboard
          </h1>
          <p className="text-slate-500 mt-4 text-lg max-w-xl mx-auto">
            You successfully authenticated with a passkey. This data is fully protected and only visible to authorized users.
          </p>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
                Authentication Tech
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Using WebAuthn via SimpleWebAuthn library to communicate with your device's built-in authenticators or roaming security keys (like YubiKey).
              </p>
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
                </svg>
                Security First
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                The session is secured with JSON Web Tokens. Try reloading the page and you will remain authenticated until you sign out.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
