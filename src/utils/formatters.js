// frontend/src/utils/formatters.js

export const formatDuration = (minutes) => {
  if (!minutes && minutes !== 0) return '--';
  if (minutes < 60) return `${minutes}m`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hrs}h ${mins}m`;
};

export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '₹0';
  return `₹${Number(amount).toFixed(0)}`;
};

export const formatDelayText = (delayMinutes) => {
  if (delayMinutes === undefined || delayMinutes === null || delayMinutes === 0) {
    return 'On schedule';
  }
  if (delayMinutes < 0) {
    return `${Math.abs(delayMinutes)}m early`;
  }
  return `+${delayMinutes}m delay`;
};

export const formatTimeFromIso = (isoString) => {
  if (!isoString) return '--:--';
  const d = new Date(isoString);
  return d.toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};
