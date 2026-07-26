import React, { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'

function EventsPage() {
  const [events, setEvents] = useState([])
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const loadEvents = async () => {
      let query = supabase.from('events').select('*')
      
      if (filter !== 'all') {
        query = query.eq('workflow_status', filter)
      }

      const { data } = await query.order('event_date', { ascending: true })
      setEvents(data || [])
    }
    loadEvents()
  }, [filter])

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Events</h2>
      
      <div className="mb-4 flex gap-2">
        {['all', 'Imported', 'Needs Review', 'Operationally Ready'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded font-medium ${
              filter === status 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Date</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Event</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Campus</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Venue</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {events.map(event => (
              <tr key={event.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">{event.event_date}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{event.title}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{event.campus}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{event.venue}</td>
                <td className="px-6 py-4 text-sm">
                  <span className="px-3 py-1 bg-blue-100 text-blue-900 rounded-full text-xs font-medium">
                    {event.workflow_status}
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

export default EventsPage
