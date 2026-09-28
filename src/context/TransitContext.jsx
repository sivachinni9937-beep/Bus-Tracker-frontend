// frontend/src/context/TransitContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { trackingApi, routesApi, transportTypesApi, alertsApi } from '../services/api';
import { useSocket } from '../hooks/useSocket';

const TransitContext = createContext(null);

export const TransitProvider = ({ children }) => {
  const [vehicles, setVehicles] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [transportTypes, setTransportTypes] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isSimulatorRunning, setIsSimulatorRunning] = useState(true);

  const { socket, isConnected } = useSocket();

  // Load initial static & live data
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [vRes, rRes, tRes, aRes, simRes] = await Promise.all([
        trackingApi.getVehicles(),
        routesApi.getAll(),
        transportTypesApi.getAll(),
        alertsApi.getActive(),
        trackingApi.getSimulatorStatus().catch(() => ({ isRunning: true }))
      ]);

      if (vRes.success) setVehicles(vRes.data || []);
      if (rRes.success) setRoutes(rRes.data || []);
      if (tRes.success) setTransportTypes(tRes.data || []);
      if (aRes.success) setAlerts(aRes.data || []);
      if (simRes.isRunning !== undefined) setIsSimulatorRunning(simRes.isRunning);
    } catch (err) {
      console.error('Failed to fetch initial transit data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle Socket.IO live updates
  useEffect(() => {
    if (!socket) return;

    // Batch initial snapshot
    socket.on('init:vehicles', (batch) => {
      if (Array.isArray(batch)) {
        setVehicles(batch);
      }
    });

    // Individual live vehicle updates
    socket.on('vehicle:update', (updatedLoc) => {
      setVehicles((prev) => {
        const idx = prev.findIndex((v) => v.vehicle_id === updatedLoc.vehicle_id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx], ...updatedLoc };
          return next;
        }
        return [...prev, updatedLoc];
      });

      // Update selected vehicle panel in real time if matched
      setSelectedVehicle((cur) => {
        if (cur && cur.vehicle_id === updatedLoc.vehicle_id) {
          return { ...cur, ...updatedLoc };
        }
        return cur;
      });
    });

    // New service alerts
    socket.on('alert:new', (newAlert) => {
      setAlerts((prev) => [newAlert, ...prev]);
    });

    // Simulator status updates
    socket.on('simulator:status', ({ isRunning }) => {
      setIsSimulatorRunning(isRunning);
    });

    return () => {
      socket.off('init:vehicles');
      socket.off('vehicle:update');
      socket.off('alert:new');
      socket.off('simulator:status');
    };
  }, [socket]);

  const toggleSimulator = async () => {
    try {
      const res = await trackingApi.toggleSimulator();
      if (res.success) {
        setIsSimulatorRunning(res.isRunning);
      }
    } catch (err) {
      console.error('Error toggling simulator:', err);
    }
  };

  const filteredVehicles = vehicles.filter((v) => {
    if (filterType !== 'all') {
      const typeId = v.vehicles?.transport_type_id || v.transport_type_id;
      if (typeId !== filterType) return false;
    }
    if (selectedRoute) {
      if (v.route_id !== selectedRoute.id) return false;
    }
    return true;
  });

  const value = {
    vehicles: filteredVehicles,
    allVehicles: vehicles,
    routes,
    transportTypes,
    alerts,
    selectedVehicle,
    selectedRoute,
    filterType,
    isLoading,
    isSocketConnected: isConnected,
    isSimulatorRunning,
    setSelectedVehicle,
    setSelectedRoute,
    setFilterType,
    toggleSimulator,
    refreshData: fetchData
  };

  return <TransitContext.Provider value={value}>{children}</TransitContext.Provider>;
};

export const useTransit = () => {
  const context = useContext(TransitContext);
  if (!context) {
    throw new Error('useTransit must be used within a TransitProvider');
  }
  return context;
};
