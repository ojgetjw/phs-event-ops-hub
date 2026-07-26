import React, { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'

function Dashboard({ userRole }) {
  const [stats, setStats] = useState({
    upcomingEvents: 0,
    needsReview: 0,
    coverageRequested: 0,
    partiallyStaffed: 0,
    operationallyReady: 0,
    openKCPDSlots: 0,
    openSecuritySlots: 0,
    estimatedCost: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        // Get upcoming events
        const { count: upcomingCount } = await supabase
          .from('events')
          .select('*', { count: 'exact' })
          .gte('event_date', new Date().toISOString().split('T')[0])
          .neq('workflow_status', 'Cancelled')

        // Get events by status
        const statuses = ['Needs Review', 'Coverage Requested', 'Partially Assigned', 'Operationally Ready']
        const statusCounts = {}
        for (const status of statuses) {
          const { count } = await supabase
            .from('events')
            .select('*', { count: 'exact' })
            .eq('workflow_status', status)
          statusCounts[status] = count
        }

        // Get open slots
        const { data: openKCPD } = await supabase
          .from('coverage_requests')
          .select('open_slots')
          .eq('provider', 'KCPD')
          .in('request_status', ['Open', 'Partial'])

        const openKCPDTotal = openKCPD?.reduce((sum, r) => sum + (r.open_slots || 0), 0) || 0

        setStats({
          upcomingEvents: upcomingCount || 0,
          needsReview: statusCounts['Needs Review'] || 0,
          coverageRequested: statusCounts['Coverage Requested'] || 0,
          partiallyStaffed: statusCounts['Partially Assigned'] || 0,
          operationallyReady: statusCounts['Operationally Ready'] || 0,
          openKCPDSlots: openKCPDTotal,
          openSecuritySlots: 0,
          estimatedCost: 0
        })
      } catch (error) {
        console.error('Error loading stats:', error)
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

  if (loading) return <div>Loading dashboard...</div>

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(stats).map(([key, value]) => (
          <div key={key} className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
            <p className="text-3xl font-bold text-blue-600">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold mb-4">Upcoming Events (7 days)</h3>
        <p className="text-gray-600">Events table will render here with full coverage status</p>
      </div>
    </div>
  )
}

export default Dashboard
