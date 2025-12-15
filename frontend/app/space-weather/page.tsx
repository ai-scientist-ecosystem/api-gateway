'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Zap, Sun, Shield, Activity } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface SpaceWeatherEvent {
  id: string;
  timeTag: string;
  kpIndex?: number;
  estimatedKp?: number;
  source: string;
  timestamp: string;
}

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function SpaceWeatherPage() {
  const { data: kpEvents, error: kpError, isLoading: kpLoading } = useSWR<SpaceWeatherEvent[]>(
    'http://localhost:8082/api/v1/collector/kp-index/latest',
    fetcher,
    {
      refreshInterval: 60000, // Refresh every minute
      fallbackData: [],
    }
  );

  const getKpLevel = (kp: number) => {
    if (kp >= 9) return { label: 'EXTREME', color: 'text-red-500 bg-red-500/10 border-red-500', impact: 'Severe space weather storm' };
    if (kp >= 7) return { label: 'SEVERE', color: 'text-orange-500 bg-orange-500/10 border-orange-500', impact: 'Strong geomagnetic storm' };
    if (kp >= 5) return { label: 'MODERATE', color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500', impact: 'Geomagnetic storm conditions' };
    if (kp >= 4) return { label: 'MINOR', color: 'text-blue-500 bg-blue-500/10 border-blue-500', impact: 'Minor space weather activity' };
    return { label: 'QUIET', color: 'text-green-500 bg-green-500/10 border-green-500', impact: 'Normal space weather' };
  };

  const latestKp = kpEvents?.[0]?.kpIndex || kpEvents?.[0]?.estimatedKp || 0;
  const kpLevel = getKpLevel(latestKp);

  const stats = {
    currentKp: latestKp.toFixed(1),
    maxKp: kpEvents?.length ? Math.max(...kpEvents.map(e => e.kpIndex || e.estimatedKp || 0)).toFixed(1) : '0',
    avgKp: kpEvents?.length 
      ? (kpEvents.reduce((sum, e) => sum + (e.kpIndex || e.estimatedKp || 0), 0) / kpEvents.length).toFixed(1)
      : '0',
    eventCount: kpEvents?.length || 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">⚡ Space Weather Monitoring</h1>
        <p className="text-gray-400">
          Real-time geomagnetic activity from NOAA Space Weather Prediction Center
        </p>
      </div>

      {/* Current Conditions Alert */}
      <div className={`border-l-4 p-6 rounded-lg ${kpLevel.color}`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-1">Current Kp Index: {stats.currentKp}</h2>
            <p className="text-sm opacity-80">{kpLevel.impact}</p>
          </div>
          <div className={`px-4 py-2 rounded-lg border font-bold ${kpLevel.color}`}>
            {kpLevel.label}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-current/20">
          <div>
            <p className="text-xs opacity-60 mb-1">Satellite Operations</p>
            <p className="text-sm font-semibold">
              {latestKp >= 7 ? '⚠️ Affected' : latestKp >= 5 ? '⚠️ Minor Impact' : '✓ Normal'}
            </p>
          </div>
          <div>
            <p className="text-xs opacity-60 mb-1">Power Systems</p>
            <p className="text-sm font-semibold">
              {latestKp >= 8 ? '⚠️ Voltage Alarms' : latestKp >= 6 ? '⚠️ Monitor' : '✓ Stable'}
            </p>
          </div>
          <div>
            <p className="text-xs opacity-60 mb-1">GPS/Navigation</p>
            <p className="text-sm font-semibold">
              {latestKp >= 7 ? '⚠️ Degraded' : latestKp >= 5 ? '⚠️ Minor Issues' : '✓ Accurate'}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <Zap className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-sm text-gray-400 mb-1">Current Kp</h3>
          <p className="text-3xl font-bold text-white">{stats.currentKp}</p>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <Activity className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-sm text-gray-400 mb-1">Max Kp (24h)</h3>
          <p className="text-3xl font-bold text-white">{stats.maxKp}</p>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <Sun className="w-8 h-8 text-yellow-400" />
          </div>
          <h3 className="text-sm text-gray-400 mb-1">Avg Kp (24h)</h3>
          <p className="text-3xl font-bold text-white">{stats.avgKp}</p>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <Shield className="w-8 h-8 text-green-400" />
          </div>
          <h3 className="text-sm text-gray-400 mb-1">Data Points</h3>
          <p className="text-3xl font-bold text-white">{stats.eventCount}</p>
        </div>
      </div>

      {/* Kp Index Scale Reference */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Kp Index Scale</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="p-4 rounded-lg border border-green-500 bg-green-500/10">
            <div className="text-2xl font-bold text-green-400 mb-2">0-3</div>
            <div className="text-sm text-green-400 font-semibold mb-1">QUIET</div>
            <div className="text-xs text-gray-400">Normal conditions</div>
          </div>
          <div className="p-4 rounded-lg border border-blue-500 bg-blue-500/10">
            <div className="text-2xl font-bold text-blue-400 mb-2">4</div>
            <div className="text-sm text-blue-400 font-semibold mb-1">MINOR</div>
            <div className="text-xs text-gray-400">Weak aurora possible</div>
          </div>
          <div className="p-4 rounded-lg border border-yellow-500 bg-yellow-500/10">
            <div className="text-2xl font-bold text-yellow-400 mb-2">5-6</div>
            <div className="text-sm text-yellow-400 font-semibold mb-1">MODERATE</div>
            <div className="text-xs text-gray-400">Aurora visible</div>
          </div>
          <div className="p-4 rounded-lg border border-orange-500 bg-orange-500/10">
            <div className="text-2xl font-bold text-orange-400 mb-2">7-8</div>
            <div className="text-sm text-orange-400 font-semibold mb-1">SEVERE</div>
            <div className="text-xs text-gray-400">Power grid impact</div>
          </div>
          <div className="p-4 rounded-lg border border-red-500 bg-red-500/10">
            <div className="text-2xl font-bold text-red-400 mb-2">9</div>
            <div className="text-sm text-red-400 font-semibold mb-1">EXTREME</div>
            <div className="text-xs text-gray-400">Critical infrastructure risk</div>
          </div>
        </div>
      </div>

      {/* Recent Events */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-lg">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-semibold">Recent Kp Index Measurements</h2>
        </div>

        <div className="divide-y divide-gray-800">
          {kpLoading && (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent 
                            rounded-full mx-auto mb-4"></div>
              <p className="text-gray-400">Loading space weather data...</p>
            </div>
          )}

          {kpError && (
            <div className="text-red-400 p-6 bg-red-500/10">
              Failed to load space weather data. Make sure data-collector service is running.
            </div>
          )}

          {!kpLoading && !kpError && kpEvents?.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              No space weather data available
            </div>
          )}

          {kpEvents?.slice(0, 20).map((event, index) => {
            const kp = event.kpIndex || event.estimatedKp || 0;
            const level = getKpLevel(kp);

            return (
              <div key={`${event.id}-${index}`} className="p-6 hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`px-4 py-2 rounded-lg border font-bold ${level.color}`}>
                      Kp {kp.toFixed(1)}
                    </div>
                    <div>
                      <p className="text-sm text-gray-200">{level.label}</p>
                      <p className="text-xs text-gray-400">{level.impact}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-300">{event.timeTag}</p>
                    <p className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
