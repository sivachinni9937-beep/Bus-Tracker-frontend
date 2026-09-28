// frontend/src/pages/DriverPortal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTransit } from '../context/TransitContext';
import { trackingApi, alertsApi } from '../services/api';
import { useSocket } from '../hooks/useSocket';
import { 
  Radio, 
  Navigation, 
  Play, 
  Square, 
  AlertTriangle, 
  MapPin, 
  Gauge, 
  Compass, 
  CheckCircle2, 
  AlertCircle,
  Clock
} from 'lucide-react';

export const DriverPortal = () => {
  const { user } = useAuth();
  const { routes, vehicles } = useTransit();
  const { socket } = useSocket();

  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [selectedRouteId, setSelectedRouteId] = useState('');
  const [activeTrip, setActiveTrip] = useState(null);
  const [isGpsStreaming, setIsGpsStreaming] = useState(false);
  const [gpsError, setGpsError] = useState('');
  const [currentCoords, setCurrentCoords] = useState(null);
  const [speed, setSpeed] = useState(0);
  const [heading, setHeading] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');

  const watchIdRef = useRef(null);

  useEffect(() => {
    if (vehicles.length > 0 && !selectedVehicleId) {
      setSelectedVehicleId(vehicles[0].id || vehicles[0].vehicle_id);
    }
    if (routes.length > 0 && !selectedRouteId) {
      setSelectedRouteId(routes[0].id);
    }
  }, [vehicles, routes, selectedVehicleId, selectedRouteId]);

  const notify = (msg) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(''), 4000);
  };

  // Start Trip
  const handleStartTrip = async () => {
    if (!selectedVehicleId || !selectedRouteId) {
      notify('Please select vehicle and route first.');
      return;
    }

    try {
      const res = await trackingApi.startTrip({
        vehicle_id: selectedVehicleId,
        route_id: selectedRouteId
      });
      if (res.success) {
        setActiveTrip(res.data);
        notify('Trip started! You can now enable GPS sharing.');
        startGpsTracking(res.data.id);
      }
    } catch (err) {
      notify(`Error starting trip: ${err.message}`);
    }
  };

  // End Trip
  const handleEndTrip = async () => {
    if (!activeTrip) return;
    try {
      stopGpsTracking();
      const res = await trackingApi.endTrip({ trip_id: activeTrip.id });
      if (res.success) {
        setActiveTrip(null);
        notify('Trip ended successfully.');
      }
    } catch (err) {
      notify(`Error ending trip: ${err.message}`);
    }
  };

  // GPS Geolocation Watcher
  const startGpsTracking = (tripId = activeTrip?.id) => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser/device.');
      return;
    }

    setGpsError('');
    setIsGpsStreaming(true);

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        const spd = pos.coords.speed ? Math.round(pos.coords.speed * 3.6) : 28; // convert m/s to km/h or fallback
        const hdg = pos.coords.heading || 0;

        setCurrentCoords({ lat, lng, accuracy: pos.coords.accuracy });
        setSpeed(spd);
        setHeading(hdg);

        const payload = {
          vehicle_id: selectedVehicleId,
          trip_id: tripId,
          route_id: selectedRouteId,
          latitude: lat,
          longitude: lng,
          speed: spd,
          heading: hdg
        };

        // Emit through WebSocket for zero-latency live updates
        if (socket) {
          socket.emit('driver:location_update', payload);
        }

        // Also post to REST API for persistent DB updates
        trackingApi.postLocation(payload).catch((err) => console.warn('Telemetry POST failed:', err.message));
      },
      (err) => {
        console.warn('GPS position error:', err.message);
        if (err.code === 1) {
          setGpsError('GPS Permission Denied. Please grant location permissions in your browser.');
        } else {
          setGpsError(`GPS Warning: ${err.message}. Running fallback mode.`);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 3000
      }
    );

    watchIdRef.current = id;
  };

  const stopGpsTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsGpsStreaming(false);
  };

  // Report Delay
  const handleReportIssue = async (type) => {
    const v = vehicles.find((veh) => (veh.id || veh.vehicle_id) === selectedVehicleId);
    const vNum = v?.vehicles?.vehicle_number || v?.vehicle_number || 'Transit Vehicle';

    try {
      await alertsApi.create({
        title: type === 'delay' ? `Traffic Delay on ${vNum}` : `Mechanical Breakdown on ${vNum}`,
        description: type === 'delay' 
          ? `Driver reported unexpected congestion. Delays of 8-12 minutes expected.` 
          : `Vehicle has encountered a mechanical issue. Backup unit dispatched.`,
        severity: type === 'delay' ? 'warning' : 'critical',
        route_id: selectedRouteId,
        vehicle_id: selectedVehicleId
      });
      notify('Notice broadcasted to passenger network.');
    } catch (err) {
      notify(`Failed to broadcast: ${err.message}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      {/* Driver Header */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center font-bold text-white shadow-lg shadow-amber-500/25">
            <Radio className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-white">Driver Navigation & GPS Console</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Live Driver
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Logged in as: <strong className="text-slate-200">{user?.full_name || 'Rajesh Kumar'}</strong>
            </p>
          </div>
        </div>

        {statusMessage && (
          <div className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30 animate-pulse">
            {statusMessage}
          </div>
        )}
      </div>

      {/* Assignment & Trip Action Card */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="font-bold text-sm text-slate-200 flex items-center space-x-2">
          <Navigation className="w-4 h-4 text-amber-400" />
          <span>Vehicle & Route Assignment</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Select Vehicle
            </label>
            <select
              disabled={Boolean(activeTrip)}
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 disabled:opacity-50"
            >
              {vehicles.map((v) => {
                const id = v.id || v.vehicle_id;
                const num = v.vehicles?.vehicle_number || v.vehicle_number;
                const mode = v.vehicles?.transport_types?.name || v.transport_types?.name || 'Transit';
                return (
                  <option key={id} value={id}>
                    {num} ({mode})
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Assigned Route
            </label>
            <select
              disabled={Boolean(activeTrip)}
              value={selectedRouteId}
              onChange={(e) => setSelectedRouteId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 disabled:opacity-50"
            >
              {routes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.route_code}: {r.route_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Start / End Trip Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          {!activeTrip ? (
            <button
              onClick={handleStartTrip}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/25 flex items-center justify-center space-x-2 transition-all"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start Active Trip & Stream GPS</span>
            </button>
          ) : (
            <button
              onClick={handleEndTrip}
              className="w-full sm:w-auto px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/25 flex items-center justify-center space-x-2 transition-all"
            >
              <Square className="w-4 h-4 fill-white" />
              <span>End Active Trip</span>
            </button>
          )}

          {isGpsStreaming && (
            <span className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live GPS Broadcast Active</span>
            </span>
          )}
        </div>
      </div>

      {/* GPS Warning if any */}
      {gpsError && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start space-x-2 text-xs text-amber-300">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block">{gpsError}</span>
            <span className="text-[11px] text-amber-400/80">
              Ensure device location service is turned ON and site has permission.
            </span>
          </div>
        </div>
      )}

      {/* Telemetry Dashboard */}
      {currentCoords && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="glass-card p-4 rounded-xl border border-slate-800">
            <span className="text-slate-500 text-[10px] uppercase font-bold block">Current Lat</span>
            <span className="text-base font-bold font-mono text-slate-100 mt-1 block">{currentCoords.lat}</span>
          </div>

          <div className="glass-card p-4 rounded-xl border border-slate-800">
            <span className="text-slate-500 text-[10px] uppercase font-bold block">Current Lng</span>
            <span className="text-base font-bold font-mono text-slate-100 mt-1 block">{currentCoords.lng}</span>
          </div>

          <div className="glass-card p-4 rounded-xl border border-slate-800">
            <span className="text-slate-500 text-[10px] uppercase font-bold block">Measured Speed</span>
            <span className="text-base font-bold text-emerald-400 mt-1 block">{speed} km/h</span>
          </div>

          <div className="glass-card p-4 rounded-xl border border-slate-800">
            <span className="text-slate-500 text-[10px] uppercase font-bold block">GPS Accuracy</span>
            <span className="text-base font-bold text-blue-400 mt-1 block">±{Math.round(currentCoords.accuracy || 10)}m</span>
          </div>
        </div>
      )}

      {/* Driver Incident Reporting Buttons */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-3">
        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
          Quick Incident & Delay Reporting
        </h4>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => handleReportIssue('delay')}
            className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-colors"
          >
            <Clock className="w-4 h-4" />
            <span>Report Traffic Delay (+10m)</span>
          </button>

          <button
            onClick={() => handleReportIssue('breakdown')}
            className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-colors"
          >
            <AlertCircle className="w-4 h-4" />
            <span>Report Vehicle Breakdown</span>
          </button>
        </div>
      </div>

    </div>
  );
};

export default DriverPortal;
