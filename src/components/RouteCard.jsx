// frontend/src/components/RouteCard.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation, Clock, MapPin, Bookmark, ArrowRight, Activity } from 'lucide-react';
import { formatDuration } from '../utils/formatters';
import { favoritesApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const RouteCard = ({ route, isFavorite = false, onToggleFavorite, activeCount = 0 }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [favorite, setFavorite] = useState(isFavorite);
  const [isBookmarking, setIsBookmarking] = useState(false);

  const handleFavoriteClick = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setIsBookmarking(true);
      if (favorite) {
        await favoritesApi.removeFavorite(route.id);
        setFavorite(false);
      } else {
        await favoritesApi.addFavorite(route.id);
        setFavorite(true);
      }
      if (onToggleFavorite) onToggleFavorite(route.id, !favorite);
    } catch (err) {
      console.error('Failed to toggle route favorite:', err);
    } finally {
      setIsBookmarking(false);
    }
  };

  const handleCardClick = () => {
    navigate(`/routes/${route.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-slate-700 bg-slate-900/60 hover:bg-slate-900/90 transition-all duration-300 cursor-pointer group hover:-translate-y-1 relative"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <span 
            className="px-3 py-1 rounded-xl text-xs font-bold tracking-wide uppercase shadow-sm"
            style={{ 
              backgroundColor: route.transport_types?.color_code ? `${route.transport_types.color_code}25` : '#3b82f625',
              color: route.transport_types?.color_code || '#3b82f6',
              border: `1px solid ${route.transport_types?.color_code || '#3b82f6'}40`
            }}
          >
            {route.route_code}
          </span>
          <span className="text-xs text-slate-400">
            {route.transport_types?.name || 'City Transit'}
          </span>
        </div>

        <button
          onClick={handleFavoriteClick}
          disabled={isBookmarking}
          title={favorite ? 'Remove from favorites' : 'Save to favorites'}
          className={`p-2 rounded-xl border transition-all ${
            favorite
              ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
              : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Bookmark className={`w-4 h-4 ${favorite ? 'fill-amber-400' : ''}`} />
        </button>
      </div>

      <h3 className="mt-3 text-base font-semibold text-slate-100 group-hover:text-blue-400 transition-colors">
        {route.route_name}
      </h3>

      {/* Origin -> Destination Flow */}
      <div className="mt-4 flex items-center space-x-2 text-xs text-slate-300">
        <div className="flex items-center space-x-1.5 truncate">
          <span className="w-2 h-2 rounded-full bg-blue-400" />
          <span className="truncate">{route.start_location}</span>
        </div>
        <ArrowRight className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
        <div className="flex items-center space-x-1.5 truncate">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="truncate">{route.end_location}</span>
        </div>
      </div>

      {/* Meta Footer */}
      <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1">
            <Navigation className="w-3.5 h-3.5 text-slate-500" />
            <span>{route.distance_km} km</span>
          </span>
          <span className="flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>{formatDuration(route.estimated_duration)}</span>
          </span>
        </div>

        <span className="flex items-center space-x-1 text-emerald-400 font-medium">
          <Activity className="w-3.5 h-3.5" />
          <span>{activeCount} Active</span>
        </span>
      </div>
    </div>
  );
};

export default RouteCard;
