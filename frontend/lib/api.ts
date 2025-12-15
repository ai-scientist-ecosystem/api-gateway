const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8085';

export async function fetchAlerts() {
  const response = await fetch(`${API_BASE_URL}/api/alerts`);
  if (!response.ok) throw new Error('Failed to fetch alerts');
  return response.json();
}

export async function fetchCriticalAlerts() {
  const response = await fetch(`${API_BASE_URL}/api/alerts/critical`);
  if (!response.ok) throw new Error('Failed to fetch critical alerts');
  return response.json();
}

export async function fetchAlertsBySeverity(severity: string) {
  const response = await fetch(`${API_BASE_URL}/api/alerts/severity/${severity}`);
  if (!response.ok) throw new Error(`Failed to fetch ${severity} alerts`);
  return response.json();
}

export async function fetchRecentEarthquakes(hours: number = 24) {
  const response = await fetch(`${API_BASE_URL}/api/earthquakes/recent?hours=${hours}`);
  if (!response.ok) throw new Error('Failed to fetch earthquakes');
  return response.json();
}

export async function fetchServiceHealth(service: string) {
  try {
    const response = await fetch(`http://localhost:${getServicePort(service)}/actuator/health`);
    return response.ok ? 'UP' : 'DOWN';
  } catch {
    return 'DOWN';
  }
}

function getServicePort(service: string): number {
  const ports: Record<string, number> = {
    'data-collector': 8082,
    'alert-engine': 8083,
    'alert-publisher': 8084,
    'api-gateway': 8085,
  };
  return ports[service] || 8080;
}
