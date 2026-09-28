// frontend/src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
  vehiclesApi, 
  routesApi, 
  stopsApi, 
  schedulesApi, 
  alertsApi, 
  authApi, 
  transportTypesApi 
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  ShieldCheck, 
  Bus, 
  Navigation2, 
  MapPin, 
  Calendar, 
  AlertTriangle, 
  Users, 
  Plus, 
  Trash2, 
  Edit, 
  CheckCircle,
  Clock,
  Sparkles
} from 'lucide-react';

export const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('vehicles');

  // Entities
  const [vehicles, setVehicles] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [stops, setStops] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [users, setUsers] = useState([]);
  const [transportTypes, setTransportTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');

  // Form states for adding items
  const [newVehicle, setNewVehicle] = useState({ vehicle_number: '', transport_type_id: '', capacity: 40, status: 'active' });
  const [newStop, setNewStop] = useState({ stop_name: '', latitude: '', longitude: '', address: '' });
  const [newAlert, setNewAlert] = useState({ title: '', description: '', severity: 'info', route_id: '' });

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [vRes, rRes, sRes, schRes, aRes, tRes] = await Promise.all([
        vehiclesApi.getAll(),
        routesApi.getAll(),
        stopsApi.getAll(),
        schedulesApi.getAll(),
        alertsApi.getAll(),
        transportTypesApi.getAll()
      ]);

      if (vRes.success) setVehicles(vRes.data || []);
      if (rRes.success) setRoutes(rRes.data || []);
      if (sRes.success) setStops(sRes.data || []);
      if (schRes.success) setSchedules(schRes.data || []);
      if (aRes.success) setAlerts(aRes.data || []);
      if (tRes.success) {
        setTransportTypes(tRes.data || []);
        if (tRes.data?.[0]?.id) {
          setNewVehicle((prev) => ({ ...prev, transport_type_id: tRes.data[0].id }));
        }
      }

      if (isAdmin) {
        const uRes = await authApi.getAllUsers();
        if (uRes.success) setUsers(uRes.data || []);
      }
    } catch (err) {
      console.error('Admin data load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isAdmin]);

  const notify = (msg) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(''), 4000);
  };

  // Vehicle creation
  const handleAddVehicle = async (e) => {
    e.preventDefault();
    if (!newVehicle.vehicle_number) return;
    try {
      const res = await vehiclesApi.create(newVehicle);
      if (res.success) {
        setVehicles((prev) => [...prev, res.data]);
        setNewVehicle({ vehicle_number: '', transport_type_id: transportTypes[0]?.id || '', capacity: 40, status: 'active' });
        notify('Fleet vehicle added successfully!');
      }
    } catch (err) {
      notify(`Error: ${err.message}`);
    }
  };

  // Stop creation
  const handleAddStop = async (e) => {
    e.preventDefault();
    if (!newStop.stop_name || !newStop.latitude || !newStop.longitude) return;
    try {
      const res = await stopsApi.create(newStop);
      if (res.success) {
        setStops((prev) => [...prev, res.data]);
        setNewStop({ stop_name: '', latitude: '', longitude: '', address: '' });
        notify('Transit stop created successfully!');
      }
    } catch (err) {
      notify(`Error: ${err.message}`);
    }
  };

  // Alert creation
  const handleAddAlert = async (e) => {
    e.preventDefault();
    if (!newAlert.title || !newAlert.description) return;
    try {
      const res = await alertsApi.create(newAlert);
      if (res.success) {
        setAlerts((prev) => [res.data, ...prev]);
        setNewAlert({ title: '', description: '', severity: 'info', route_id: '' });
        notify('Service alert broadcasted!');
      }
    } catch (err) {
      notify(`Error: ${err.message}`);
    }
  };

  // Delete Alert
  const handleDeleteAlert = async (id) => {
    try {
      await alertsApi.delete(id);
      setAlerts((prev) => prev.filter((a) => a.id !== id));
      notify('Alert deleted.');
    } catch (err) {
      notify(`Error: ${err.message}`);
    }
  };

  // Update user role
  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await authApi.updateUserRole(userId, newRole);
      if (res.success) {
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
        notify(`User role updated to ${newRole}`);
      }
    } catch (err) {
      notify(`Error: ${err.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="Initializing Administrator Control Panel..." />
      </div>
    );
  }

  const tabs = [
    { id: 'vehicles', label: 'Fleet Vehicles', icon: Bus, count: vehicles.length },
    { id: 'routes', label: 'Routes & Stops', icon: Navigation2, count: routes.length },
    { id: 'stops', label: 'Transit Stations', icon: MapPin, count: stops.length },
    { id: 'schedules', label: 'Timetables', icon: Calendar, count: schedules.length },
    { id: 'alerts', label: 'Service Alerts', icon: AlertTriangle, count: alerts.length },
    ...(isAdmin ? [{ id: 'users', label: 'User Roles', icon: Users, count: users.length }] : [])
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-purple-400 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Transit Authority Control Center</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            System Administration
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage public vehicles, routes, schedules, stations, and passenger service alerts.
          </p>
        </div>

        {statusMessage && (
          <div className="px-4 py-2 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-semibold animate-pulse">
            {statusMessage}
          </div>
        )}
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                active
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${active ? 'bg-purple-500/30 text-white' : 'bg-slate-800 text-slate-400'}`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Vehicles Management */}
      {activeTab === 'vehicles' && (
        <div className="space-y-6">
          {/* Add Vehicle Form */}
          <div className="glass-card p-5 rounded-2xl border border-slate-800">
            <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center space-x-1.5">
              <Plus className="w-4 h-4 text-purple-400" />
              <span>Register New Fleet Vehicle</span>
            </h3>
            <form onSubmit={handleAddVehicle} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <input
                type="text"
                required
                placeholder="Vehicle No (e.g. OD-02-B-9988)"
                value={newVehicle.vehicle_number}
                onChange={(e) => setNewVehicle({ ...newVehicle, vehicle_number: e.target.value })}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />

              <select
                value={newVehicle.transport_type_id}
                onChange={(e) => setNewVehicle({ ...newVehicle, transport_type_id: e.target.value })}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              >
                {transportTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>

              <input
                type="number"
                placeholder="Capacity"
                value={newVehicle.capacity}
                onChange={(e) => setNewVehicle({ ...newVehicle, capacity: e.target.value })}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />

              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-500 text-white font-semibold py-2 px-4 rounded-xl transition-colors"
              >
                Add Vehicle
              </button>
            </form>
          </div>

          {/* Vehicles Table */}
          <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 uppercase font-semibold">
                    <th className="py-3 px-4">Vehicle Number</th>
                    <th className="py-3 px-4">Transport Mode</th>
                    <th className="py-3 px-4">Passenger Capacity</th>
                    <th className="py-3 px-4">Operator</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {vehicles.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-900/40">
                      <td className="py-3 px-4 font-mono font-bold text-slate-200">{v.vehicle_number}</td>
                      <td className="py-3 px-4 text-slate-300">{v.transport_types?.name || 'City Bus'}</td>
                      <td className="py-3 px-4 text-slate-400">{v.capacity} seats</td>
                      <td className="py-3 px-4 text-slate-400">{v.operator?.full_name || 'Navapura Transit'}</td>
                      <td className="py-3 px-4 text-right">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {v.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Stops Management */}
      {activeTab === 'stops' && (
        <div className="space-y-6">
          {/* Add Stop Form */}
          <div className="glass-card p-5 rounded-2xl border border-slate-800">
            <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center space-x-1.5">
              <Plus className="w-4 h-4 text-purple-400" />
              <span>Register New Transit Station / Stop</span>
            </h3>
            <form onSubmit={handleAddStop} className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
              <input
                type="text"
                required
                placeholder="Station Name"
                value={newStop.stop_name}
                onChange={(e) => setNewStop({ ...newStop, stop_name: e.target.value })}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
              <input
                type="number"
                step="any"
                required
                placeholder="Latitude (e.g. 20.285)"
                value={newStop.latitude}
                onChange={(e) => setNewStop({ ...newStop, latitude: e.target.value })}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
              <input
                type="number"
                step="any"
                required
                placeholder="Longitude (e.g. 85.830)"
                value={newStop.longitude}
                onChange={(e) => setNewStop({ ...newStop, longitude: e.target.value })}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
              <input
                type="text"
                placeholder="Address / Landmark"
                value={newStop.address}
                onChange={(e) => setNewStop({ ...newStop, address: e.target.value })}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-500 text-white font-semibold py-2 px-4 rounded-xl transition-colors"
              >
                Create Stop
              </button>
            </form>
          </div>

          {/* Stops List */}
          <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 uppercase font-semibold">
                    <th className="py-3 px-4">Stop Name</th>
                    <th className="py-3 px-4">Coordinates</th>
                    <th className="py-3 px-4">Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {stops.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-900/40">
                      <td className="py-3 px-4 font-semibold text-slate-200">{s.stop_name}</td>
                      <td className="py-3 px-4 font-mono text-slate-400">{s.latitude}, {s.longitude}</td>
                      <td className="py-3 px-4 text-slate-400">{s.address || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Alerts Management */}
      {activeTab === 'alerts' && (
        <div className="space-y-6">
          {/* Add Alert Form */}
          <div className="glass-card p-5 rounded-2xl border border-slate-800">
            <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center space-x-1.5">
              <Plus className="w-4 h-4 text-purple-400" />
              <span>Broadcast Real-Time Service Alert</span>
            </h3>
            <form onSubmit={handleAddAlert} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Alert Title"
                  value={newAlert.title}
                  onChange={(e) => setNewAlert({ ...newAlert, title: e.target.value })}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />

                <select
                  value={newAlert.severity}
                  onChange={(e) => setNewAlert({ ...newAlert, severity: e.target.value })}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="info">Info Advisory</option>
                  <option value="warning">Warning / Delay</option>
                  <option value="critical">Critical / Interruption</option>
                </select>

                <select
                  value={newAlert.route_id}
                  onChange={(e) => setNewAlert({ ...newAlert, route_id: e.target.value })}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="">All Corridors (System-wide)</option>
                  {routes.map((r) => (
                    <option key={r.id} value={r.id}>{r.route_code}: {r.route_name}</option>
                  ))}
                </select>
              </div>

              <textarea
                required
                rows={2}
                placeholder="Detailed alert description for passengers..."
                value={newAlert.description}
                onChange={(e) => setNewAlert({ ...newAlert, description: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />

              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-500 text-white font-semibold py-2 px-5 rounded-xl transition-colors"
              >
                Broadcast to Network
              </button>
            </form>
          </div>

          {/* Alerts List */}
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="glass-card p-4 rounded-xl border border-slate-800 flex items-start justify-between gap-4"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      alert.severity === 'critical'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : alert.severity === 'warning'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    }`}>
                      {alert.severity}
                    </span>
                    <h4 className="font-semibold text-sm text-slate-100">{alert.title}</h4>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{alert.description}</p>
                </div>

                <button
                  onClick={() => handleDeleteAlert(alert.id)}
                  title="Delete Alert"
                  className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: User Roles Management (Admin only) */}
      {activeTab === 'users' && isAdmin && (
        <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 uppercase font-semibold">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Current Role</th>
                  <th className="py-3 px-4 text-right">Promote / Assign Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-900/40">
                    <td className="py-3 px-4 font-semibold text-slate-200">{u.full_name}</td>
                    <td className="py-3 px-4 text-slate-400">{u.email}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-purple-500"
                      >
                        <option value="passenger">Passenger</option>
                        <option value="driver">Driver</option>
                        <option value="operator">Operator</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Fallback for other tabs */}
      {(activeTab === 'routes' || activeTab === 'schedules') && (
        <div className="glass-card p-8 rounded-2xl border border-slate-800 text-center text-xs text-slate-400">
          Showing {activeTab} managed by Navapura Municipal Transit Authority.
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
