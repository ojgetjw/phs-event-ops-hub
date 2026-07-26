import React, { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'

function CoverageRequestsPage({ userRole }) {
  const [requests, setRequests] = useState([])

  useEffect(() => {
    const loadRequests = async () => {
      let query = supabase
        .from('coverage_requests')
        .select('*, events(*)')
        .order('request_status')

      const { data } = await query
      setRequests(data || [])
    }
    loadRequests()
  }, [])

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Coverage Requests</h2>
      <p className="text-gray-600 mb-4">
        {userRole === 'kcpd_scheduler' ? 'KCPD Coverage Requests' : 'Contract Security Coverage Requests'}
      </p>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Date</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Event</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Needed</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Assigned</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Open</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {requests.map(req => (
              <tr key={req.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">{req.events?.event_date}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{req.events?.title}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{req.officers_required}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{req.assigned_count || 0}</td>
                <td className="px-6 py-4 text-sm font-medium text-red-600">{req.open_slots}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    req.request_status === 'Full' ? 'bg-green-100 text-green-900' :
                    req.request_status === 'Partial' ? 'bg-yellow-100 text-yellow-900' :
                    'bg-red-100 text-red-900'
                  }`}>
                    {req.request_status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default CoverageRequestsPage
