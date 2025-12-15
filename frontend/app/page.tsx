'use client';

import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { Alert, DashboardStats } from '@/lib/types';
import AlertCard from '@/components/AlertCard';
import StatsCard from '@/components/StatsCard';
import RealTimeServiceStatus from '@/components/RealTimeServiceStatus';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function DashboardPage() {
  const { data: alerts, error } = useSWR<Alert[]>('http://localhost:8085/api/alerts', fetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds
    fallbackData: [],
  });

  const { data: waterStats } = useSWR(
    'http://localhost:8085/api/data-collector/api/v1/water-level/stats',
    fetcher,
    {
      refreshInterval: 60000, // Refresh every 60 seconds
      fallbackData: { noaaStations: 0, usgsStations: 0, activeStations: 0, currentlyFlooding: 0 },
    }
  );

  const [stats, setStats] = useState<DashboardStats>({
    totalAlerts: 0,
    criticalAlerts: 0,
    earthquakes: 0,
    averageKp: 0,
  });

  const waterLevelStats = {
    totalStations: (waterStats?.noaaStations || 0) + (waterStats?.usgsStations || 0),
    activeStations: waterStats?.activeStations || 0,
    flooding: waterStats?.currentlyFlooding || 0,
  };

  useEffect(() => {
    if (alerts && alerts.length > 0) {
      const critical = alerts.filter(a => a.severity === 'EXTREME' || a.severity === 'SEVERE').length;
      const earthquakes = alerts.filter(a => a.alertType === 'EARTHQUAKE').length;
      const kpAlerts = alerts.filter(a => a.kpValue).map(a => a.kpValue || 0);
      const avgKp = kpAlerts.length > 0 ? kpAlerts.reduce((a, b) => a + b, 0) / kpAlerts.length : 0;

      setStats({
        totalAlerts: alerts.length,
        criticalAlerts: critical,
        earthquakes,
        averageKp: Number(avgKp.toFixed(2)),
      });
    }
  }, [alerts]);

  const latestAlerts = alerts?.slice(0, 10) || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard Overview</h1>
        <p className="text-gray-400">Real-time monitoring of disasters and space weather events</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatsCard
          title="Total Alerts"
          value={stats.totalAlerts}
          icon="🚨"
          color="blue"
        />
        <StatsCard
          title="Critical Alerts"
          value={stats.criticalAlerts}
          icon="⚠️"
          color="red"
        />
        <StatsCard
          title="Active Earthquakes"
          value={stats.earthquakes}
          icon="🌍"
          color="yellow"
        />
        <StatsCard
          title="Avg Kp Index"
          value={stats.averageKp}
          icon="⚡"
          color="green"
        />
        <a href="/water-levels" className="block transition-transform hover:scale-105">
          <StatsCard
            title="Water Levels"
            value={waterLevelStats.flooding > 0 ? waterLevelStats.flooding : waterLevelStats.activeStations}
            icon="🌊"
            color={waterLevelStats.flooding > 0 ? "red" : "cyan"}
            subtitle={waterLevelStats.flooding > 0 ? `${waterLevelStats.flooding} flooding` : `${waterLevelStats.totalStations} stations`}
          />
        </a>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latest Alerts - Takes 2 columns */}
        <div className="lg:col-span-2">
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Latest Alerts</h2>
              <a href="/alerts" className="text-sm text-blue-400 hover:text-blue-300">
                View All →
              </a>
            </div>
            
            {error && (
              <div className="text-red-400 p-4 bg-red-500/10 border border-red-500/20 rounded">
                Failed to load alerts. Make sure API Gateway is running on port 8085.
              </div>
            )}

            {!error && latestAlerts.length === 0 && (
              <div className="text-gray-400 text-center py-8">
                No alerts available. Collecting data from NASA/NOAA/USGS...
              </div>
            )}

            <div className="space-y-4">
              {latestAlerts.map((alert) => (
                <AlertCard key={alert.id} alert={alert} />
              ))}
            </div>
          </div>
        </div>

        {/* System Status - Takes 1 column */}
        <div className="lg:col-span-1">
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6">System Status</h2>
            
            <RealTimeServiceStatus />

            <div className="mt-6 pt-6 border-t border-gray-800">
              <h3 className="text-sm font-semibold mb-3 text-gray-400">Data Sources</h3>
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex justify-between">
                  <span>NASA API</span>
                  <span className="text-green-400">✓</span>
                </div>
                <div className="flex justify-between">
                  <span>NOAA API</span>
                  <span className="text-green-400">✓</span>
                </div>
                <div className="flex justify-between">
                  <span>USGS API</span>
                  <span className="text-green-400">✓</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-800">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Last Update</span>
                <span className="text-gray-300" suppressHydrationWarning>
                  {typeof window !== 'undefined' ? new Date().toLocaleTimeString() : '--:--:--'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
