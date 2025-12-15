export interface Alert {
  id: string;
  alertType: string;
  severity: 'EXTREME' | 'SEVERE' | 'STRONG' | 'MODERATE' | 'MINOR' | 'WARNING';
  kpValue?: number;
  magnitude?: number;
  location?: string;
  description: string;
  timestamp: string;
  createdAt: string;
}

export interface SystemStatus {
  service: string;
  status: 'UP' | 'DOWN' | 'DEGRADED';
  instances: number;
}

export interface DashboardStats {
  totalAlerts: number;
  criticalAlerts: number;
  earthquakes: number;
  averageKp: number;
}
