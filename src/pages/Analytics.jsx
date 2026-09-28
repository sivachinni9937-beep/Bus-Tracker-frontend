// frontend/src/pages/Analytics.jsx
import React, { useState, useEffect } from 'react';
import { analyticsApi } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid 
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Download, 
  Calendar, 
  Bus, 
  Activity 
} from 'lucide-react';

export const Analytics = () => {
  const [summary, setSummary] = useState(null);
  const [delayTrends, setDelayTrends] = useState([]);
  const [punctuality, setPunctuality] = useState([]);
  const [scheduledVsActual, setScheduledVsActual] = useState([]);
  const [dailyFrequency, setDailyFrequency] = useState([]);
  const [delayDist, setDelayDist] = useState([]);
  const [transportUsage, setTransportUsage] = useState([]);
  const [peakHours, setPeakHours] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        const [
          sumRes,
          delRes,
          puncRes,
          svaRes,
          freqRes,
          distRes,
          usageRes,
          peakRes
        ] = await Promise.all([
          analyticsApi.getSummary(),
          analyticsApi.getDelays(),
          analyticsApi.getPunctuality(5),
          analyticsApi.getScheduledVsActual(),
          analyticsApi.getDailyFrequency(),
          analyticsApi.getDelayDistribution(),
          analyticsApi.getTransportUsage(),
          analyticsApi.getPeakHours()
        ]);

        if (sumRes.success) setSummary(sumRes.data);
        if (delRes.success) setDelayTrends(delRes.data);
        if (puncRes.success) setPunctuality(puncRes.data);
        if (svaRes.success) setScheduledVsActual(svaRes.data);
        if (freqRes.success) setDailyFrequency(freqRes.data);
        if (distRes.success) setDelayDist(distRes.data);
        if (usageRes.success) setTransportUsage(usageRes.data);
        if (peakRes.success) setPeakHours(peakRes.data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const handleExportCSV = () => {
    if (!delayTrends || delayTrends.length === 0) return;
    const headers = Object.keys(delayTrends[0]).join(',');
    const rows = delayTrends.map((row) => Object.values(row).join(','));
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `transit_delay_analytics_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="Aggregating transit punctuality & operational analytics..." />
      </div>
    );
  }

  const tooltipStyle = {
    backgroundColor: '#0f172a',
    borderColor: '#334155',
    borderRadius: '10px',
    fontSize: '12px',
    color: '#f8fafc'
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>Operational Intelligence</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Transport Analytics & Punctuality
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time punctuality metrics, delay distribution, vehicle utilization, and peak travel demand.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center space-x-2 transition-all shadow-sm"
        >
          <Download className="w-4 h-4 text-blue-400" />
          <span>Export Analytics CSV</span>
        </button>
      </div>

      {/* Summary Metric Cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          <div className="glass-card p-4 rounded-xl border border-slate-800">
            <span className="text-slate-500 text-[10px] uppercase font-bold block">Active Fleet</span>
            <span className="text-xl font-bold text-white mt-1 block">{summary.total_active_vehicles}</span>
          </div>

          <div className="glass-card p-4 rounded-xl border border-slate-800">
            <span className="text-slate-500 text-[10px] uppercase font-bold block">Live Trips</span>
            <span className="text-xl font-bold text-blue-400 mt-1 block">{summary.total_active_trips}</span>
          </div>

          <div className="glass-card p-4 rounded-xl border border-slate-800">
            <span className="text-slate-500 text-[10px] uppercase font-bold block">Trips Today</span>
            <span className="text-xl font-bold text-slate-200 mt-1 block">{summary.completed_trips_today}</span>
          </div>

          <div className="glass-card p-4 rounded-xl border border-slate-800">
            <span className="text-slate-500 text-[10px] uppercase font-bold block">Avg Delay</span>
            <span className="text-xl font-bold text-amber-400 mt-1 block">{summary.average_delay_minutes}m</span>
          </div>

          <div className="glass-card p-4 rounded-xl border border-slate-800">
            <span className="text-slate-500 text-[10px] uppercase font-bold block">On-Time %</span>
            <span className="text-xl font-bold text-emerald-400 mt-1 block">{summary.on_time_percentage}%</span>
          </div>

          <div className="glass-card p-4 rounded-xl border border-slate-800">
            <span className="text-slate-500 text-[10px] uppercase font-bold block">Cancellations</span>
            <span className="text-xl font-bold text-rose-400 mt-1 block">{summary.cancelled_trips_today}</span>
          </div>

          <div className="glass-card p-4 rounded-xl border border-slate-800 col-span-2">
            <span className="text-slate-500 text-[10px] uppercase font-bold block">Top Mode</span>
            <span className="text-sm font-semibold text-cyan-300 mt-1 truncate block">{summary.most_used_transport_type}</span>
          </div>
        </div>
      )}

      {/* Grid of 7 Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Delay Trends */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-100">Chart 1: Transport Delay Trends</h3>
              <p className="text-xs text-slate-400">Average delay fluctuations across time of day (minutes)</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={delayTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="time" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} unit="m" />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="average_delay" name="Fleet Avg" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="city_bus" name="City Bus" stroke="#06b6d4" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="shared_auto" name="Shared Auto" stroke="#f59e0b" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: On-Time Performance */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-100">Chart 2: On-Time Performance</h3>
              <p className="text-xs text-slate-400">Punctuality percentage against 90% municipal SLA target</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={punctuality}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="transport_type" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} domain={[70, 100]} unit="%" />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="on_time_percentage" name="On-Time %" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="target_percentage" name="Target (90%)" fill="#334155" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Scheduled vs Actual Arrival */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-100">Chart 3: Scheduled vs Actual Travel Duration</h3>
              <p className="text-xs text-slate-400">Comparison of timetable duration vs actual measured trip duration (minutes)</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scheduledVsActual}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="route" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} unit="m" />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="scheduled_duration" name="Scheduled (min)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actual_duration" name="Actual (min)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Daily Transport Frequency */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-100">Chart 4: Daily Completed Trips</h3>
              <p className="text-xs text-slate-400">Total completed passenger trips per day by transport mode</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyFrequency}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="day" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="city_bus" name="City Bus" stackId="a" fill="#3b82f6" />
                <Bar dataKey="shared_auto" name="Shared Auto" stackId="a" fill="#f59e0b" />
                <Bar dataKey="minibus" name="Mini-Bus" stackId="a" fill="#06b6d4" />
                <Bar dataKey="electric_bus" name="Electric Bus" stackId="a" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 5: Delay Distribution */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-100">Chart 5: Delay Distribution</h3>
              <p className="text-xs text-slate-400">Punctuality categories across all operating trips</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={delayDist}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="category" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} unit="%" />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="percentage" name="% of Trips" fill="#38bdf8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 6: Transport Type Usage (Donut) */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-100">Chart 6: Fleet Transport Mode Share</h3>
              <p className="text-xs text-slate-400">Share of total completed trips by vehicle type</p>
            </div>
          </div>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={transportUsage}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="trips"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {transportUsage.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#3b82f6'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 7: Peak Travel Hours (Area Chart) */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-100">Chart 7: Peak Travel Hours</h3>
              <p className="text-xs text-slate-400">Hourly trip volume showcasing morning and evening commute surges</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={peakHours}>
                <defs>
                  <linearGradient id="peakGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="hour" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="trips" name="Completed Trips" stroke="#3b82f6" fillOpacity={1} fill="url(#peakGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Analytics;
