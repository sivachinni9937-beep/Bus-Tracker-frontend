// frontend/src/pages/Routes.jsx
import React, { useState } from 'react';
import { useTransit } from '../context/TransitContext';
import RouteCard from '../components/RouteCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Search, Navigation2, Filter, Layers } from 'lucide-react';

export const Routes = () => {
  const { routes, transportTypes, vehicles, isLoading } = useTransit();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  const filteredRoutes = routes.filter((r) => {
    const matchesSearch =
      r.route_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.route_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.start_location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.end_location.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedType !== 'all') {
      if (r.transport_type_id !== selectedType && r.transport_types?.id !== selectedType) {
        return false;
      }
    }

    return true;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="Loading transit routes and corridors..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">
            <Navigation2 className="w-4 h-4" />
            <span>Transit Corridors</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            City Routes & Networks
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Browse active transit corridors, sequence of stops, and assigned vehicles across Navapura.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search route or stop..."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedType === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              All Modes
            </button>
            {transportTypes.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedType(t.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedType === t.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Routes Grid */}
      {filteredRoutes.length === 0 ? (
        <div className="glass-card py-16 px-4 rounded-2xl text-center border border-slate-800">
          <Layers className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-300">No Routes Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            No transit routes match your current query or transport mode filter. Try adjusting your search term.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRoutes.map((route) => {
            const activeCount = vehicles.filter((v) => v.route_id === route.id).length;
            return (
              <RouteCard
                key={route.id}
                route={route}
                activeCount={activeCount}
              />
            );
          })}
        </div>
      )}

    </div>
  );
};

export default Routes;
