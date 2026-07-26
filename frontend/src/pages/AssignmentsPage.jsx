import React, { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'

function AssignmentsPage({ userRole }) {
  const [assignments, setAssignments] = useState([])

  useEffect(() => {
    const loadAssignments = async () => {
      const { data } = await supabase
        .from('assignments')
        .select('*, events(*), coverage_requests(*)')
        .order('created_at', { ascending: false })
      setAssignments(data || [])
    }
    loadAssignments()
  }, [])

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Staff Assignments</h2>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Person</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Event</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Provider</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Shift</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {assignments.map(a => (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{a.person_name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{a.events?.title}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{a.provider}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{a.shift_start}–{a.shift_end}</td>
                <td className="px-6 py-4 text-sm">
                  <span className="px-3 py-1 bg-blue-100 text-blue-900 rounded-full text-xs font-medium">
                    {a.assignment_status}
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

export default AssignmentsPage
