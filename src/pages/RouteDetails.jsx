// frontend/src/pages/RouteDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { routesApi, schedulesApi, trackingApi } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import VehicleMarker from '../components/VehicleMarker';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Navigation, 
  Calendar, 
  AlertCircle, 
  ArrowRight,
  Bus,
  CheckCircle2
} from 'lucide-react';
import { formatDuration, formatCurrency } from '../utils/formatters';

const stopMarkerIcon = L.divIcon({
  className: 'route-stop-icon',
  html: `<div style="width: 12px; height: 12px; border-radius: 50%; background: #3b82f6; border: 2px solid white;"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6]
});

export const RouteDetails = () => {
  const { id } = useParams();
  const [route, setRoute] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [activeVehicles, setActiveVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRouteData = async () => {
      try {
        setIsLoading(true);
        const [rRes, sRes, vRes] = await Promise.all([
          routesApi.getById(id),
          schedulesApi.getAll({ route_id: id }),
          trackingApi.getRouteTracking(id)
        ]);

        if (rRes.success) setRoute(rRes.data);
        if (sRes.success) setSchedules(sRes.data || []);
        if (vRes.success) setActiveVehicles(vRes.data || []);
      } catch (err) {
        console.error('Error fetching route details:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRouteData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="Fetching route details & stops..." />
      </div>
    );
  }

  if (!route) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-200">Route Not Found</h2>
        <Link to="/routes" className="mt-4 inline-block text-blue-400 hover:underline text-sm">
          ← Back to Routes
        </Link>
      </div>
    );
  }

  const mapCenter = route.route_geometry && route.route_geometry.length > 0
    ? route.route_geometry[0]
    : [20.2850, 85.8300];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Back button & Breadcrumb */}
      <div>
        <Link
          to="/routes"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Routes</span>
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <span 
              className="px-3 py-1 rounded-xl text-sm font-bold uppercase tracking-wider"
              style={{
                backgroundColor: `${route.transport_types?.color_code || '#3b82f6'}25`,
                color: route.transport_types?.color_code || '#3b82f6',
                border: `1px solid ${route.transport_types?.color_code || '#3b82f6'}40`
              }}
            >
              {route.route_code}
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                {route.route_name}
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Operated by {route.transport_types?.name || 'City Transit'} • {route.stops?.length || 0} Scheduled Stops
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-xs text-slate-300">
            <div className="glass-card px-3 py-2 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Total Distance</span>
              <span className="font-semibold">{route.distance_km} km</span>
            </div>
            <div className="glass-card px-3 py-2 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Est. Duration</span>
              <span className="font-semibold">{formatDuration(route.estimated_duration)}</span>
            </div>
            <div className="glass-card px-3 py-2 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Fare</span>
              <span className="font-semibold text-emerald-400">
                {formatCurrency(route.transport_types?.default_fare || 15)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Map & Corridor Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Interactive Route Map */}
        <div className="lg:col-span-2 glass-panel rounded-2xl border border-slate-800 overflow-hidden h-[420px] relative">
          <MapContainer
            center={mapCenter}
            zoom={13}
            scrollWheelZoom={false}
            className="w-full h-full"
          >
            <TileLayer
              attribution='&copy; CARTO'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />

            {/* Polyline */}
            {route.route_geometry && (
              <Polyline
                positions={route.route_geometry}
                pathOptions={{
                  color: route.transport_types?.color_code || '#3b82f6',
                  weight: 4.5,
                  opacity: 0.9
                }}
              />
            )}

            {/* Stops Markers */}
            {route.stops?.map((s) => {
              const stopData = s.stops || s;
              return (
                <Marker
                  key={s.id}
                  position={[stopData.latitude, stopData.longitude]}
                  icon={stopMarkerIcon}
                >
                  <Popup>
                    <div className="p-1 text-slate-900 text-xs">
                      <span className="font-bold block">{stopData.stop_name}</span>
                      <span className="text-slate-500 block mt-0.5">Stop #{s.stop_order}</span>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {/* Live vehicles on this route */}
            {activeVehicles.map((v) => (
              <VehicleMarker key={v.vehicle_id} vehicle={v} />
            ))}
          </MapContainer>
        </div>

        {/* Ordered Stops List */}
        <div className="glass-card rounded-2xl border border-slate-800 p-5 flex flex-col h-[420px] overflow-hidden">
          <h3 className="font-bold text-sm text-slate-200 mb-4 flex items-center justify-between">
            <span>Route Stops Sequence</span>
            <span className="text-xs text-blue-400 font-semibold">{route.stops?.length || 0} Stops</span>
          </h3>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {route.stops && route.stops.map((s, index) => {
              const stopData = s.stops || s;
              const isFirst = index === 0;
              const isLast = index === (route.stops.length - 1);

              return (
                <div key={s.id} className="flex items-start space-x-3 text-xs">
                  <div className="flex flex-col items-center">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                      isFirst 
                        ? 'bg-blue-600 text-white' 
                        : isLast 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      {s.stop_order}
                    </span>
                    {!isLast && <span className="w-0.5 h-6 bg-slate-800 my-0.5" />}
                  </div>

                  <div className="flex-1 pt-0.5">
                    <span className="font-semibold text-slate-200 block">
                      {stopData.stop_name}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      +{s.scheduled_offset_minutes}m • {s.distance_from_start} km
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Timetable / Schedules for this route */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800">
        <h3 className="text-base font-bold text-white mb-4 flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-blue-400" />
          <span>Scheduled Departures & Timetable</span>
        </h3>

        {schedules.length === 0 ? (
          <p className="text-xs text-slate-500 py-4">No schedules registered for this corridor.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {schedules.map((sched) => (
              <div key={sched.id} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                <div className="flex items-center justify-between font-mono font-semibold text-slate-200">
                  <span>{sched.departure_time}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  <span>{sched.arrival_time}</span>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                  <span>{sched.vehicles?.vehicle_number || 'Assigned Transit'}</span>
                  <span className="text-emerald-400 font-medium">Daily</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default RouteDetails;
