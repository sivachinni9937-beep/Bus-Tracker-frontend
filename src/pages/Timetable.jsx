// frontend/src/pages/Timetable.jsx
import React, { useState, useEffect } from 'react';
import { schedulesApi, routesApi, transportTypesApi } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { Calendar, Filter, Clock, Bus, CheckCircle2, ArrowRight } from 'lucide-react';

export const Timetable = () => {
  const [schedules, setSchedules] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [transportTypes, setTransportTypes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState('all');
  const [selectedDay, setSelectedDay] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [sRes, rRes, tRes] = await Promise.all([
          schedulesApi.getAll(),
          routesApi.getAll(),
          transportTypesApi.getAll()
        ]);
        if (sRes.success) setSchedules(sRes.data || []);
        if (rRes.success) setRoutes(rRes.data || []);
        if (tRes.success) setTransportTypes(tRes.data || []);
      } catch (err) {
        console.error('Error fetching schedules:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredSchedules = schedules.filter((s) => {
    if (selectedRoute !== 'all' && s.route_id !== selectedRoute) return false;
    if (selectedDay !== 'all') {
      if (s.operating_days && !s.operating_days.includes(selectedDay)) return false;
    }
    return true;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="Fetching city transit timetables & frequencies..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">
            <Calendar className="w-4 h-4" />
            <span>Transit Schedules</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            City Timetable & Departures
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Scheduled departure times, operational frequencies, and active operating days.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Route filter */}
          <select
            value={selectedRoute}
            onChange={(e) => setSelectedRoute(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Transit Routes</option>
            {routes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.route_code}: {r.route_name}
              </option>
            ))}
          </select>

          {/* Day filter */}
          <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setSelectedDay('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedDay === 'all' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Days
            </button>
            {daysOfWeek.map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDay(d)}
                className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                  selectedDay === d ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Timetable Table */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Route</th>
                <th className="py-3 px-4">Departs</th>
                <th className="py-3 px-4">Expected Arrival</th>
                <th className="py-3 px-4">Model & Frequency</th>
                <th className="py-3 px-4">Operating Days</th>
                <th className="py-3 px-4">Assigned Vehicle</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredSchedules.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500">
                    No schedules match your selected route or day filter.
                  </td>
                </tr>
              ) : (
                filteredSchedules.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-blue-400 block text-xs">
                        {s.routes?.route_code}
                      </span>
                      <span className="text-slate-300 font-medium">
                        {s.routes?.route_name}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-sm text-slate-100">
                      {s.departure_time}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {s.arrival_time}
                    </td>

                    <td className="py-3.5 px-4">
                      {s.frequency_minutes ? (
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          Every {s.frequency_minutes} mins
                        </span>
                      ) : (
                        <span className="text-slate-400">Fixed Timetable</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-1">
                        {daysOfWeek.map((day) => {
                          const active = s.operating_days?.includes(day);
                          return (
                            <span
                              key={day}
                              className={`w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold ${
                                active
                                  ? 'bg-blue-600/30 text-blue-400 border border-blue-500/40'
                                  : 'text-slate-600'
                              }`}
                            >
                              {day[0]}
                            </span>
                          );
                        })}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {s.vehicles?.vehicle_number || 'Rotational Fleet'}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Timetable;
