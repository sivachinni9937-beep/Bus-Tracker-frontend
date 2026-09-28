// frontend/src/utils/constants.js

export const DEFAULT_MAP_CENTER = [20.2850, 85.8300];
export const DEFAULT_MAP_ZOOM = 13;

export const TRANSPORT_TYPE_COLORS = {
  'City Bus': '#3B82F6',
  'Mini-Bus': '#06B6D4',
  'Shared Auto': '#F59E0B',
  'Electric Bus (EV)': '#10B981',
  'Local Shuttle': '#8B5CF6'
};

export const DELAY_STATUS_CONFIG = {
  early: {
    label: 'Early',
    badgeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    dotColor: '#10B981'
  },
  on_time: {
    label: 'On Time',
    badgeClass: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    dotColor: '#3B82F6'
  },
  delayed: {
    label: 'Delayed',
    badgeClass: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    dotColor: '#F59E0B'
  }
};
