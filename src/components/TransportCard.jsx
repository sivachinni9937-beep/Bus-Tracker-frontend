// frontend/src/components/TransportCard.jsx
import React from 'react';
import { Bus, Zap, Car, Shield, Gauge, Users, Tag } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

const iconMap = {
  bus: Bus,
  'bus-front': Bus,
  car: Car,
  zap: Zap,
  van: Bus,
};

export const TransportCard = ({ type, isSelected = false, onSelect, activeVehiclesCount = 0 }) => {
  const IconComponent = iconMap[type.icon_name] || Bus;

  return (
    <div
      onClick={onSelect}
      className={`glass-card p-5 rounded-2xl cursor-pointer transition-all duration-300 relative overflow-hidden group border ${
        isSelected
          ? 'border-blue-500 bg-slate-900/90 shadow-lg shadow-blue-500/10 -translate-y-1'
          : 'border-slate-800 hover:border-slate-700 hover:bg-slate-900/60 hover:-translate-y-0.5'
      }`}
    >
      {/* Accent color bar */}
      <div 
        className="absolute top-0 left-0 right-0 h-1 transition-opacity"
        style={{ backgroundColor: type.color_code || '#3b82f6' }}
      />

      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-inner"
            style={{ 
              backgroundColor: `${type.color_code || '#3b82f6'}20`, 
              color: type.color_code || '#3b82f6' 
            }}
          >
            <IconComponent className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 group-hover:text-blue-400 transition-colors">
              {type.name}
            </h3>
            <p className="text-xs text-slate-400 capitalize">
              {type.operating_model?.replace('_', ' ')}
            </p>
          </div>
        </div>

        {/* Live Active Badge */}
        <span className="flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>{activeVehiclesCount} Live</span>
        </span>
      </div>

      <p className="mt-3 text-xs text-slate-400 line-clamp-2 leading-relaxed">
        {type.description || 'Reliable transit mode connecting key points across the city.'}
      </p>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-800/80 text-xs">
        <div className="flex flex-col">
          <span className="text-slate-500 flex items-center gap-1">
            <Gauge className="w-3 h-3" /> Speed
          </span>
          <span className="font-semibold text-slate-200 mt-0.5">
            ~{type.default_speed} km/h
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-slate-500 flex items-center gap-1">
            <Users className="w-3 h-3" /> Seats
          </span>
          <span className="font-semibold text-slate-200 mt-0.5">
            {type.default_capacity} pass.
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-slate-500 flex items-center gap-1">
            <Tag className="w-3 h-3" /> Fare
          </span>
          <span className="font-semibold text-emerald-400 mt-0.5">
            {formatCurrency(type.default_fare)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TransportCard;
