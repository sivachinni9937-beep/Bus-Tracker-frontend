// frontend/src/components/VehicleMarker.jsx
import React, { useMemo } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { DELAY_STATUS_CONFIG } from '../utils/constants';
import { formatDuration } from '../utils/formatters';

export const VehicleMarker = ({ vehicle, isSelected = false, onSelect }) => {
  const {
    vehicle_id,
    latitude,
    longitude,
    heading = 0,
    speed = 0,
    eta_next_stop_minutes = 0,
    delay_status = 'on_time',
    current_delay_minutes = 0,
    vehicles,
    routes,
    next_stop
  } = vehicle;

  const transportType = vehicles?.transport_types;
  const color = transportType?.color_code || '#3b82f6';
  const delayConfig = DELAY_STATUS_CONFIG[delay_status] || DELAY_STATUS_CONFIG.on_time;

  // Custom animated DivIcon
  const customIcon = useMemo(() => {
    const isElectric = transportType?.name?.toLowerCase().includes('electric');
    const isAuto = transportType?.name?.toLowerCase().includes('auto');

    let symbol = '🚌';
    if (isElectric) symbol = '⚡';
    if (isAuto) symbol = '🛺';

    const html = `
      <div style="position: relative; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
        <div style="
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background-color: ${color};
          opacity: 0.25;
          animation: markerPulse 2s infinite;
        "></div>
        <div style="
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #0f172a;
          border: 2.5px solid ${isSelected ? '#ffffff' : color};
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.5);
          transform: rotate(${heading || 0}deg);
          transition: transform 0.5s ease;
        ">
          <span style="font-size: 14px; transform: rotate(-${heading || 0}deg);">${symbol}</span>
        </div>
        <div style="
          position: absolute;
          bottom: -2px;
          right: -2px;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background-color: ${delayConfig.dotColor};
          border: 2px solid #0f172a;
        "></div>
      </div>
    `;

    return L.divIcon({
      className: 'custom-vehicle-marker',
      html,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -22]
    });
  }, [color, isSelected, heading, delayConfig, transportType]);

  if (!latitude || !longitude) return null;

  return (
    <Marker
      position={[latitude, longitude]}
      icon={customIcon}
      eventHandlers={{
        click: () => onSelect && onSelect(vehicle)
      }}
    >
      <Popup className="custom-leaflet-popup">
        <div className="p-1 min-w-[200px] text-slate-100 font-sans text-xs">
          <div className="flex items-center justify-between border-b border-slate-700/80 pb-2 mb-2">
            <span className="font-bold text-sm text-blue-400">
              {vehicles?.vehicle_number || 'Transit Vehicle'}
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${delayConfig.badgeClass}`}>
              {delayConfig.label}
            </span>
          </div>

          <p className="text-slate-300 font-medium mb-1">
            {routes?.route_name || 'Active Route'}
          </p>

          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800 text-slate-400">
            <div>
              <span className="block text-[10px] uppercase text-slate-500">Speed</span>
              <span className="font-semibold text-slate-200">{speed} km/h</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase text-slate-500">Next Stop ETA</span>
              <span className="font-semibold text-emerald-400">{eta_next_stop_minutes}m</span>
            </div>
          </div>

          {next_stop && (
            <div className="mt-2 text-slate-300">
              <span className="text-[10px] text-slate-500 uppercase block">Next Stop</span>
              <span className="truncate block font-medium">{next_stop.stop_name}</span>
            </div>
          )}

          <button
            onClick={() => onSelect && onSelect(vehicle)}
            className="w-full mt-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-center font-medium transition-colors"
          >
            View Live Details
          </button>
        </div>
      </Popup>
    </Marker>
  );
};

export default VehicleMarker;
