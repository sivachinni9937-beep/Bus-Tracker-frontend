// frontend/src/pages/Home.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTransit } from '../context/TransitContext';
import { useAuth } from '../context/AuthContext';
import TransportCard from '../components/TransportCard';
import RouteCard from '../components/RouteCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  Search, 
  MapPin, 
  Navigation, 
  Clock, 
  AlertTriangle, 
  ArrowRight, 
  Zap, 
  Radio, 
  Calendar,
  Sparkles,
  TrendingUp,
  Bookmark
} from 'lucide-react';
import { journeysApi } from '../services/api';

export const Home = () => {
  const navigate = useNavigate();
  const { routes, transportTypes, vehicles, alerts, isLoading } = useTransit();
  const { isAuthenticated, user } = useAuth();

  // Journey Search Form State
  const [origin, setOrigin] = useState('Central Railway Station');
  const [destination, setDestination] = useState('Infocity Tech Park');
  const [selectedType, setSelectedType] = useState('all');
  const [isSearching, setIsSearching] = useState(false);
  const [journeyResults, setJourneyResults] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!origin.trim() || !destination.trim()) return;

    try {
      setIsSearching(true);
      const res = await journeysApi.search({
        origin,
        destination,
        preferredTransportType: selectedType !== 'all' ? selectedType : undefined
      });
      if (res.success) {
        setJourneyResults(res.data || []);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="Connecting to Navapura transit network..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16">
      
      {/* 1. Hero Section & Journey Search Planner */}
      <section className="relative pt-12 pb-16 overflow-hidden border-b border-slate-800/80 bg-gradient-to-b from-blue-950/20 via-slate-950 to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.15),rgba(255,255,255,0))] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Small City Intelligent Transit • Navapura</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white">
              Real-Time Transit Tracking, <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400">
                Predictable Daily Commutes
              </span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-300">
              Live GPS tracking for city buses, feeder mini-buses, shared autos, and electric shuttles. Accurate arrival predictions, delay warnings, and smart multi-modal connections.
            </p>
          </div>

          {/* Quick Service Alerts Strip */}
          {alerts && alerts.length > 0 && (
            <div className="max-w-4xl mx-auto mb-8">
              <div className="glass-card p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 flex items-center justify-between text-xs text-amber-200">
                <div className="flex items-center space-x-2.5 truncate">
                  <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span className="font-semibold text-amber-300">Transit Alert:</span>
                  <span className="truncate">{alerts[0].title} — {alerts[0].description}</span>
                </div>
                <Link to="/map" className="ml-4 font-semibold text-amber-400 hover:underline flex-shrink-0">
                  View Map →
                </Link>
              </div>
            </div>
          )}

          {/* Journey Planner Search Box */}
          <div className="max-w-4xl mx-auto glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl shadow-blue-900/20">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Origin Input */}
                <div className="relative">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Origin Station / Stop
                  </label>
                  <div className="relative">
                    <MapPin className="w-5 h-5 text-blue-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                      placeholder="e.g. Central Railway Station"
                      className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Destination Input */}
                <div className="relative">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Destination Station / Stop
                  </label>
                  <div className="relative">
                    <Navigation className="w-5 h-5 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder="e.g. Infocity Tech Park"
                      className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Filter by Transport Type & Search Button */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                  <button
                    type="button"
                    onClick={() => setSelectedType('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedType === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    All Modes
                  </button>
                  {transportTypes.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedType(t.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                        selectedType === t.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={isSearching}
                  className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-sm font-semibold rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/25 transition-all"
                >
                  <Search className="w-4 h-4" />
                  <span>{isSearching ? 'Finding Routes...' : 'Plan Journey'}</span>
                </button>
              </div>
            </form>

            {/* Journey Search Results Dropdown/Cards */}
            {journeyResults && (
              <div className="mt-6 pt-6 border-t border-slate-800">
                <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center justify-between">
                  <span>Available Route Options ({journeyResults.length})</span>
                  <button 
                    onClick={() => setJourneyResults(null)}
                    className="text-xs text-slate-500 hover:text-slate-300"
                  >
                    Clear Results
                  </button>
                </h4>

                <div className="space-y-3">
                  {journeyResults.length === 0 ? (
                    <p className="text-xs text-slate-500 py-3 text-center">
                      No direct or single-transfer connections found between these locations. Try alternative nearby stops.
                    </p>
                  ) : (
                    journeyResults.map((opt) => (
                      <div
                        key={opt.id}
                        className="glass-card p-4 rounded-xl border border-slate-800/80 hover:border-slate-700 bg-slate-900/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                              {opt.type === 'direct' ? 'Direct' : '1 Transfer'}
                            </span>
                            <span className="font-semibold text-sm text-slate-100">
                              Departs {opt.departure_time} → Arrives {opt.expected_arrival_time}
                            </span>
                          </div>

                          <div className="text-xs text-slate-400 flex items-center space-x-3 pt-1">
                            <span>Duration: {opt.total_duration_minutes}m</span>
                            <span>•</span>
                            <span>Wait: ~{opt.waiting_time_minutes}m</span>
                            <span>•</span>
                            <span className="text-emerald-400 font-semibold">₹{opt.total_fare}</span>
                          </div>

                          <p className="text-[11px] text-slate-500">
                            {opt.factors?.join(' • ')}
                          </p>
                        </div>

                        <Link
                          to="/map"
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-colors"
                        >
                          <span>Track Live</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. Transport Types Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Supported Transport Modes
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Diverse city transit models configured for small city connectivity and last-mile accessibility.
            </p>
          </div>
          <Link
            to="/routes"
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center space-x-1"
          >
            <span>View All Routes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {transportTypes.map((type) => {
            const count = vehicles.filter(
              (v) => (v.vehicles?.transport_type_id || v.transport_type_id) === type.id
            ).length;

            return (
              <TransportCard
                key={type.id}
                type={type}
                activeVehiclesCount={count}
                onSelect={() => navigate(`/map?type=${type.id}`)}
              />
            );
          })}
        </div>
      </section>

      {/* 3. Featured Transit Corridors & Quick Map Preview Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="glass-panel p-8 rounded-3xl border border-slate-800 relative overflow-hidden bg-gradient-to-r from-slate-900 via-blue-950/30 to-slate-900">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="max-w-xl">
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Interactive Fleet Telemetry
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mt-3">
                Watch City Vehicles Move in Real Time
              </h2>
              <p className="text-sm text-slate-300 mt-2">
                Open the interactive Leaflet map to inspect GPS coordinates, calculated stop ETAs, speed telemetry, and route polylines.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Link
                to="/map"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl flex items-center space-x-2 shadow-lg shadow-blue-600/30 transition-all"
              >
                <MapPin className="w-4 h-4" />
                <span>Open Full Live Map</span>
              </Link>
              <Link
                to="/analytics"
                className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm rounded-xl flex items-center space-x-2 transition-all border border-slate-700"
              >
                <TrendingUp className="w-4 h-4" />
                <span>Punctuality Analytics</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Active Routes Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Primary City Routes
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              High-frequency arterial and feeder routes serving Navapura.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {routes.slice(0, 4).map((r) => {
            const activeVehiclesOnRoute = vehicles.filter((v) => v.route_id === r.id).length;
            return (
              <RouteCard
                key={r.id}
                route={r}
                activeCount={activeVehiclesOnRoute}
              />
            );
          })}
        </div>
      </section>

    </div>
  );
};

export default Home;
