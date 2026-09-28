// frontend/src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { favoritesApi } from '../services/api';
import RouteCard from '../components/RouteCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { User, Mail, Shield, Phone, Bookmark, Trash2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Profile = () => {
  const { user, logout } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setIsLoading(true);
        const res = await favoritesApi.getFavorites();
        if (res.success) {
          setFavorites(res.data || []);
        }
      } catch (err) {
        console.error('Failed to load favorites:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  const handleRemoveFavorite = async (routeId) => {
    try {
      await favoritesApi.removeFavorite(routeId);
      setFavorites((prev) => prev.filter((f) => f.routes?.id !== routeId));
    } catch (err) {
      console.error('Error removing favorite:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* User Info Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center font-bold text-2xl text-white shadow-lg shadow-blue-500/25">
            {user?.full_name ? user.full_name[0].toUpperCase() : 'U'}
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-white">{user?.full_name}</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30">
                {user?.role}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-2">
              <span className="flex items-center space-x-1">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>{user?.email}</span>
              </span>
              {user?.phone && (
                <span className="flex items-center space-x-1">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span>{user?.phone}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="px-4 py-2 bg-slate-900 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/30 text-slate-300 hover:text-rose-400 text-xs font-semibold rounded-xl transition-all"
        >
          Sign Out
        </button>
      </div>

      {/* Saved Favorite Routes */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <Bookmark className="w-5 h-5 text-amber-400" />
          <h2 className="text-xl font-bold text-white">Bookmarked Favorite Corridors</h2>
        </div>

        {isLoading ? (
          <LoadingSpinner message="Loading saved favorite corridors..." />
        ) : favorites.length === 0 ? (
          <div className="glass-card p-12 rounded-2xl border border-slate-800 text-center">
            <Bookmark className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-slate-300">No Favorite Routes Saved</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Save your regular commuter routes to quickly check departure predictions and delays.
            </p>
            <Link
              to="/routes"
              className="mt-4 inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-colors"
            >
              <span>Explore Routes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favorites.map((fav) => {
              if (!fav.routes) return null;
              return (
                <div key={fav.id} className="relative group">
                  <RouteCard
                    route={fav.routes}
                    isFavorite={true}
                    onToggleFavorite={() => handleRemoveFavorite(fav.routes.id)}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default Profile;
