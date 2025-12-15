'use client';

import { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';

interface Service {
  name: string;
  port: number;
  displayName: string;
}

const services: Service[] = [
  { name: 'api-gateway', port: 8085, displayName: 'API Gateway' },
  { name: 'data-collector', port: 8082, displayName: 'Data Collector' },
  { name: 'alert-engine', port: 8083, displayName: 'Alert Engine' },
  { name: 'alert-publisher', port: 8084, displayName: 'Alert Publisher' },
];

interface ServiceStatus {
  name: string;
  displayName: string;
  status: 'UP' | 'DOWN' | 'CHECKING';
  responseTime?: number;
  lastChecked?: Date;
}

export default function RealTimeServiceStatus() {
  const [serviceStatuses, setServiceStatuses] = useState<ServiceStatus[]>(
    services.map(s => ({ 
      name: s.name, 
      displayName: s.displayName,
      status: 'CHECKING' as const 
    }))
  );

  const checkServiceHealth = async (service: Service): Promise<ServiceStatus> => {
    const startTime = Date.now();
    try {
      // Use API proxy to avoid CORS
      const response = await fetch(`/api/health-check?service=${service.name}&port=${service.port}`, {
        method: 'GET',
        signal: AbortSignal.timeout(3000), // 3 second timeout
      });
      
      const responseTime = Date.now() - startTime;
      const data = await response.json();
      
      return {
        name: service.name,
        displayName: service.displayName,
        status: data.status === 'UP' ? 'UP' : 'DOWN',
        responseTime,
        lastChecked: new Date(),
      };
    } catch (error) {
      return {
        name: service.name,
        displayName: service.displayName,
        status: 'DOWN',
        responseTime: Date.now() - startTime,
        lastChecked: new Date(),
      };
    }
  };

  const checkAllServices = async () => {
    const results = await Promise.all(services.map(checkServiceHealth));
    setServiceStatuses(results);
  };

  useEffect(() => {
    // Check immediately on mount
    checkAllServices();

    // Then check every 30 seconds
    const interval = setInterval(checkAllServices, 30000);

    return () => clearInterval(interval);
  }, []);

  const statusColors = {
    UP: 'bg-green-500',
    DOWN: 'bg-red-500',
    CHECKING: 'bg-yellow-500',
  };

  return (
    <div className="space-y-3">
      {serviceStatuses.map((service) => (
        <div
          key={service.name}
          className="flex items-center justify-between p-3 border border-gray-700 rounded-lg 
                   hover:border-gray-600 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${statusColors[service.status]} 
                          ${service.status === 'CHECKING' ? 'animate-pulse' : ''}`} 
            />
            <span className="text-sm font-medium text-gray-200">{service.displayName}</span>
          </div>
          
          <div className="flex items-center gap-3">
            {service.responseTime && (
              <span className="text-xs text-gray-500">
                {service.responseTime}ms
              </span>
            )}
            <span className={`text-xs px-2 py-1 rounded ${
              service.status === 'UP' 
                ? 'bg-green-500/20 text-green-400' 
                : service.status === 'DOWN'
                ? 'bg-red-500/20 text-red-400'
                : 'bg-yellow-500/20 text-yellow-400'
            }`}>
              {service.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
