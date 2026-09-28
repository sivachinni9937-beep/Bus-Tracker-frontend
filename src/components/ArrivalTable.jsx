// frontend/src/components/ArrivalTable.jsx
import React from 'react';
import { Clock, MapPin, AlertCircle, CheckCircle } from 'lucide-react';
import { DELAY_STATUS_CONFIG } from '../utils/constants';

export const ArrivalTable = ({ predictions = [], currentStopId = null }) => {
  if (!predictions || predictions.length === 0) {
    return (
      <div className="py-8 text-center text-slate-500 text-xs">
        No arrival predictions currently available for this trip.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
            <th className="pb-2 pl-2">#</th>
            <th className="pb-2">Stop</th>
            <th className="pb-2">Predicted Time</th>
            <th className="pb-2">ETA</th>
            <th className="pb-2 pr-2 text-right">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {predictions.map((p, idx) => {
            const isNext = p.stop_id === currentStopId || idx === 0;
            const delayConfig = p.delay_minutes > 2 
              ? DELAY_STATUS_CONFIG.delayed 
              : p.delay_minutes < -1 
              ? DELAY_STATUS_CONFIG.early 
              : DELAY_STATUS_CONFIG.on_time;

            return (
              <tr 
                key={p.stop_id || idx}
                className={`transition-colors ${
                  isNext ? 'bg-blue-500/10 font-medium' : 'hover:bg-slate-900/40'
                }`}
              >
                <td className="py-2.5 pl-2 text-slate-500">
                  {p.stop_order || idx + 1}
                </td>
                <td className="py-2.5 text-slate-200">
                  <div className="flex items-center space-x-1.5">
                    {isNext && <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />}
                    <span>{p.stop_name}</span>
                  </div>
                </td>
                <td className="py-2.5 text-slate-300 font-mono">
                  {p.predicted_arrival_time}
                </td>
                <td className="py-2.5 text-slate-300 font-mono">
                  in {p.eta_minutes}m
                </td>
                <td className="py-2.5 pr-2 text-right">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${delayConfig.badgeClass}`}>
                    {delayConfig.label}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ArrivalTable;
