import React, { useState, useEffect } from 'react'
import { supabase } from './utils/supabase'
import Dashboard from './pages/Dashboard'
import EventsPage from './pages/EventsPage'
import CoverageRequestsPage from './pages/CoverageRequestsPage'
import AssignmentsPage from './pages/AssignmentsPage'
import LoginPage from './pages/LoginPage'

function App() {
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        const { data: userRecord } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single()
        setUserRole(userRecord?.role)
      }
      setLoading(false)
    }
    checkUser()
  }, [])

  if (loading) return <div className="p-8 text-center">Loading...</div>
  
  if (!user) return <LoginPage onLogin={() => setUser} />

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">PHS Event Operations Hub</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.email}</span>
            <button onClick={() => supabase.auth.signOut()} className="text-sm text-red-600 hover:text-red-800">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar navigation */}
        <nav className="w-48 bg-white shadow-md h-screen sticky top-0">
          <div className="p-4 space-y-2">
            {['Dashboard', 'Events', 'Coverage Requests', 'Assignments'].map((item) => (
              <button
                key={item}
                onClick={() => setCurrentPage(item.toLowerCase().replace(' ', '-'))}
                className={`w-full text-left px-4 py-2 rounded ${
                  currentPage === item.toLowerCase().replace(' ', '-')
                    ? 'bg-blue-100 text-blue-900 font-bold'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item}
              </button>
            ))}
            {userRole === 'admin' && (
              <button className="w-full text-left px-4 py-2 rounded text-gray-700 hover:bg-gray-100">
                Admin Settings
              </button>
            )}
          </div>
        </nav>

        {/* Main content */}
        <main className="flex-1 p-6">
          {currentPage === 'dashboard' && <Dashboard userRole={userRole} />}
          {currentPage === 'events' && <EventsPage />}
          {currentPage === 'coverage-requests' && <CoverageRequestsPage userRole={userRole} />}
          {currentPage === 'assignments' && <AssignmentsPage userRole={userRole} />}
        </main>
      </div>
    </div>
  )
}

export default App
