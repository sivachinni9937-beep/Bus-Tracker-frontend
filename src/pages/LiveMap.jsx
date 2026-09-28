// frontend/src/pages/LiveMap.jsx
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useTransit } from '../context/TransitContext';
import VehicleMarker from '../components/VehicleMarker';
import ArrivalTable from '../components/ArrivalTable';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  DEFAULT_MAP_CENTER, 
  DEFAULT_MAP_ZOOM, 
  DELAY_STATUS_CONFIG 
} from '../utils/constants';
import { journeysApi } from '../services/api';
import { 
  Bus, 
  Search, 
  Filter, 
  Navigation, 
  Clock, 
  X, 
  AlertTriangle, 
  Layers, 
  Zap, 
  Car, 
  Radio, 
  ShieldAlert, 
  Compass, 
  HelpCircle,
  Activity
} from 'lucide-react';

// Custom stop icon for Leaflet
const stopIcon = L.divIcon({
  className: 'custom-stop-marker',
  html: `
    <div style="
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #0f172a;
      border: 3px solid #60a5fa;
      box-shadow: 0 0 8px rgba(96,165,250,0.8);
    "></div>
  `,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
  popupAnchor: [0, -10]
});

// Helper component to center map when selecting a vehicle
const MapCenterController = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 15, { animate: true, duration: 1.2 });
    }
  }, [center, map]);
  return null;
};

export const LiveMap = () => {
  const { 
    vehicles, 
    routes, 
    transportTypes, 
    selectedVehicle, 
    setSelectedVehicle, 
    selectedRoute, 
    setSelectedRoute,
    isSimulatorRunning,
    toggleSimulator,
    isLoading 
  } = useTransit();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTypeFilter, setActiveTypeFilter] = useState('all');
  const [showStops, setShowStops] = useState(true);
  const [showPolylines, setShowPolylines] = useState(true);
  const [alternatives, setAlternatives] = useState(null);
  const [loadingAlternatives, setLoadingAlternatives] = useState(false);

  // Filter vehicles
  const displayVehicles = vehicles.filter((v) => {
    const matchesSearch = 
      (v.vehicles?.vehicle_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.routes?.route_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.routes?.route_code || '').toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTypeFilter !== 'all') {
      const typeId = v.vehicles?.transport_type_id || v.transport_type_id;
      if (typeId !== activeTypeFilter) return false;
    }

    if (selectedRoute && v.route_id !== selectedRoute.id) {
      return false;
    }

    return true;
  });

  // Extract all unique stops from active routes
  const stopsList = [];
  routes.forEach((r) => {
    if (r.stops) {
      r.stops.forEach((s) => {
        const stopData = s.stops || s;
        if (stopData && !stopsList.some((existing) => existing.id === stopData.id)) {
          stopsList.push(stopData);
        }
      });
    }
  });

  const handleFetchAlternatives = async (routeId, vehicleId) => {
    try {
      setLoadingAlternatives(true);
      const res = await journeysApi.getAlternatives({ route_id: routeId, vehicle_id: vehicleId });
      if (res.success) {
        setAlternatives(res.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch route alternatives:', err);
    } finally {
      setLoadingAlternatives(false);
    }
  };

  const selectedDelayConfig = selectedVehicle
    ? DELAY_STATUS_CONFIG[selectedVehicle.delay_status] || DELAY_STATUS_CONFIG.on_time
    : null;

  return (
    <div className="relative w-full h-[calc(100vh-64px)] overflow-hidden bg-slate-950 flex flex-col md:flex-row">
      
      {/* Top Floating Controls Bar */}
      <div className="absolute top-4 left-4 right-4 z-[400] pointer-events-none flex flex-wrap items-center justify-between gap-3">
        
        {/* Search Bar & Mode Filters */}
        <div className="pointer-events-auto flex items-center space-x-2 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-800 shadow-xl max-w-lg w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search vehicle # or route code..."
              className="w-full bg-slate-800/80 border border-slate-700/60 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center space-x-1 overflow-x-auto pr-1">
            <button
              onClick={() => setActiveTypeFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTypeFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({vehicles.length})
            </button>
            {transportTypes.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTypeFilter(t.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  activeTypeFilter === t.id
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        {/* Map Layers & Simulator Control */}
        <div className="pointer-events-auto flex items-center space-x-2 bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-2xl border border-slate-800 shadow-xl text-xs">
          
          <button
            onClick={() => setShowStops(!showStops)}
            className={`px-2 py-1 rounded font-medium transition-all ${
              showStops ? 'bg-blue-500/20 text-blue-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            Stops
          </button>

          <button
            onClick={() => setShowPolylines(!showPolylines)}
            className={`px-2 py-1 rounded font-medium transition-all ${
              showPolylines ? 'bg-blue-500/20 text-blue-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            Corridors
          </button>

          <span className="text-slate-700">|</span>

          {/* Simulator Status Indicator */}
          <div className="flex items-center space-x-1.5 pl-1">
            <span className={`w-2 h-2 rounded-full ${isSimulatorRunning ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className="text-slate-300 font-medium">
              {isSimulatorRunning ? 'Simulation Live' : 'Simulation Paused'}
            </span>
            <button
              onClick={toggleSimulator}
              className="ml-1 text-[11px] underline text-blue-400 hover:text-blue-300 font-semibold"
            >
              {isSimulatorRunning ? 'Pause' : 'Resume'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Leaflet Map View */}
      <div className="flex-1 w-full h-full relative z-0">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <LoadingSpinner message="Rendering GIS Map & Fleet Telemetry..." />
          </div>
        ) : (
          <MapContainer
            center={DEFAULT_MAP_CENTER}
            zoom={DEFAULT_MAP_ZOOM}
            scrollWheelZoom={true}
            className="w-full h-full"
            style={{ background: '#020617' }}
          >
            {/* OpenStreetMap Dark Tile Provider */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              maxZoom={19}
            />

            {/* Recenter controller if a vehicle is selected */}
            {selectedVehicle && selectedVehicle.latitude && selectedVehicle.longitude && (
              <MapCenterController center={[selectedVehicle.latitude, selectedVehicle.longitude]} />
            )}

            {/* Route Polylines */}
            {showPolylines && routes.map((r) => {
              if (!r.route_geometry || r.route_geometry.length < 2) return null;
              const isSelected = selectedRoute && selectedRoute.id === r.id;
              const color = r.transport_types?.color_code || '#3b82f6';

              return (
                <Polyline
                  key={r.id}
                  positions={r.route_geometry}
                  pathOptions={{
                    color: isSelected ? '#ffffff' : color,
                    weight: isSelected ? 5 : 3.5,
                    opacity: isSelected ? 0.95 : 0.7,
                    dashArray: r.status === 'diverted' ? '6 6' : undefined
                  }}
                  eventHandlers={{
                    click: () => setSelectedRoute(r)
                  }}
                />
              );
            })}

            {/* Stop Markers */}
            {showStops && stopsList.map((stop) => (
              <Marker
                key={stop.id}
                position={[stop.latitude, stop.longitude]}
                icon={stopIcon}
              >
                <Popup>
                  <div className="p-1 text-slate-900 text-xs">
                    <span className="font-bold block text-sm">{stop.stop_name}</span>
                    <span className="text-slate-500 block mt-0.5">{stop.address}</span>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Live Vehicle Markers */}
            {displayVehicles.map((v) => (
              <VehicleMarker
                key={v.vehicle_id}
                vehicle={v}
                isSelected={selectedVehicle && selectedVehicle.vehicle_id === v.vehicle_id}
                onSelect={(veh) => {
                  setSelectedVehicle(veh);
                  setAlternatives(null);
                }}
              />
            ))}
          </MapContainer>
        )}
      </div>

      {/* Slide-over Detailed Vehicle Panel */}
      {selectedVehicle && (
        <aside className="w-full md:w-96 glass-panel border-t md:border-t-0 md:border-l border-slate-800 bg-slate-950/95 backdrop-blur-xl z-[450] flex flex-col h-[50vh] md:h-full overflow-y-auto">
          
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg"
                style={{
                  backgroundColor: `${selectedVehicle.vehicles?.transport_types?.color_code || '#3b82f6'}25`,
                  color: selectedVehicle.vehicles?.transport_types?.color_code || '#3b82f6'
                }}
              >
                🚌
              </div>
              <div>
                <h3 className="font-bold text-base text-white">
                  {selectedVehicle.vehicles?.vehicle_number || 'Transit Unit'}
                </h3>
                <p className="text-xs text-slate-400">
                  {selectedVehicle.vehicles?.transport_types?.name || 'City Transport'}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedVehicle(null);
                setAlternatives(null);
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Route & Live Status */}
          <div className="p-4 space-y-4">
            
            {/* Status & Punctuality Tag */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center space-x-2">
                <span className={`w-2.5 h-2.5 rounded-full ${selectedDelayConfig.dotColor === '#10B981' ? 'bg-emerald-400' : selectedDelayConfig.dotColor === '#F59E0B' ? 'bg-amber-400' : 'bg-blue-400'} animate-pulse`} />
                <span className="text-xs font-semibold text-slate-200">
                  {selectedDelayConfig.label}
                </span>
              </div>
              <span className="text-xs font-mono font-medium text-slate-400">
                {selectedVehicle.current_delay_minutes > 0 ? `+${selectedVehicle.current_delay_minutes}m delay` : 'On schedule'}
              </span>
            </div>

            {/* Assigned Route */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                Active Route
              </span>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <div className="text-xs font-bold text-blue-400">
                  {selectedVehicle.routes?.route_code}
                </div>
                <div className="text-sm font-semibold text-slate-200 mt-0.5">
                  {selectedVehicle.routes?.route_name || 'Corridor Route'}
                </div>
              </div>
            </div>

            {/* Telemetry Metric Badges */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Current Speed</span>
                <span className="text-base font-bold text-slate-100 mt-1 block">
                  {selectedVehicle.speed} km/h
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Next Stop ETA</span>
                <span className="text-base font-bold text-emerald-400 mt-1 block">
                  ~{selectedVehicle.eta_next_stop_minutes} mins
                </span>
              </div>
            </div>

            {/* Next Stop Callout */}
            {selectedVehicle.next_stop && (
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <span className="text-[10px] uppercase font-bold text-blue-400 block">
                  Approaching Stop
                </span>
                <span className="text-sm font-semibold text-white block mt-0.5">
                  {selectedVehicle.next_stop.stop_name}
                </span>
              </div>
            )}

            {/* Upcoming Stops & ETA Predictions */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Sequential Stop Predictions
              </span>
              <ArrivalTable 
                predictions={selectedVehicle.predictions || []}
                currentStopId={selectedVehicle.next_stop_id}
              />
            </div>

            {/* Alternative Transport Recommendation Trigger */}
            <div className="pt-2">
              <button
                onClick={() => handleFetchAlternatives(selectedVehicle.route_id, selectedVehicle.vehicle_id)}
                disabled={loadingAlternatives}
                className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl flex items-center justify-center space-x-2 transition-colors"
              >
                <Activity className="w-4 h-4 text-amber-400" />
                <span>
                  {loadingAlternatives ? 'Searching alternatives...' : 'Find Alternative Options'}
                </span>
              </button>

              {/* Render Alternatives if requested */}
              {alternatives && (
                <div className="mt-3 space-y-2">
                  <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Suggested Parallel Services
                  </h5>
                  {alternatives.length === 0 ? (
                    <p className="text-xs text-slate-500">No parallel alternatives found at this time.</p>
                  ) : (
                    alternatives.map((alt, i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-200">{alt.vehicle_number} ({alt.route_code})</span>
                          <span className="text-emerald-400 font-medium">ETA {alt.eta_next_stop_minutes}m</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">{alt.recommendation}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Simulated Data Disclaimer Notice */}
            {selectedVehicle.is_simulated && (
              <p className="text-[10px] text-slate-500 text-center italic pt-2">
                * Note: Telemetry currently sourced from Navapura Demo Simulation Engine.
              </p>
            )}

          </div>
        </aside>
      )}

    </div>
  );
};

export default LiveMap;
