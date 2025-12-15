'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Activity, MapPin, Clock, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Earthquake {
  earthquakeId: string;
  magnitude: number;
  location: string;
  depth: number;
  latitude: number;
  longitude: number;
  timestamp: string;
  tsunamiRiskScore?: number;
  url?: string;
}

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function EarthquakesPage() {
  const [timeRange, setTimeRange] = useState(24);

  const { data: earthquakes, error, isLoading } = useSWR<Earthquake[]>(
    `http://localhost:8085/api/data-collector/api/v1/earthquake/recent?hours=${timeRange}`,
    fetcher,
    {
      refreshInterval: 60000, // Refresh every minute
      fallbackData: [],
    }
  );

  const getMagnitudeColor = (mag: number) => {
    if (mag >= 7.0) return 'text-red-500 bg-red-500/10 border-red-500';
    if (mag >= 6.0) return 'text-orange-500 bg-orange-500/10 border-orange-500';
    if (mag >= 5.0) return 'text-yellow-500 bg-yellow-500/10 border-yellow-500';
    return 'text-blue-500 bg-blue-500/10 border-blue-500';
  };

  const getMagnitudeLabel = (mag: number) => {
    if (mag >= 8.0) return 'Great';
    if (mag >= 7.0) return 'Major';
    if (mag >= 6.0) return 'Strong';
    if (mag >= 5.0) return 'Moderate';
    return 'Light';
  };

  const stats = {
    total: earthquakes?.length || 0,
    major: earthquakes?.filter(e => e.magnitude >= 6.0).length || 0,
    avgMagnitude: earthquakes?.length 
      ? (earthquakes.reduce((sum, e) => sum + e.magnitude, 0) / earthquakes.length).toFixed(2)
      : 0,
    tsunamiRisk: earthquakes?.filter(e => (e.tsunamiRiskScore || 0) > 50).length || 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">🌍 Earthquake Monitoring</h1>
        <p className="text-gray-400">
          Real-time earthquake data from USGS
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <Activity className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-sm text-gray-400 mb-1">Total Earthquakes</h3>
          <p className="text-3xl font-bold text-white">{stats.total}</p>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-sm text-gray-400 mb-1">Major Events (M≥6.0)</h3>
          <p className="text-3xl font-bold text-white">{stats.major}</p>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <Activity className="w-8 h-8 text-yellow-400" />
          </div>
          <h3 className="text-sm text-gray-400 mb-1">Avg Magnitude</h3>
          <p className="text-3xl font-bold text-white">{stats.avgMagnitude}</p>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <AlertTriangle className="w-8 h-8 text-purple-400" />
          </div>
          <h3 className="text-sm text-gray-400 mb-1">Tsunami Risk</h3>
          <p className="text-3xl font-bold text-white">{stats.tsunamiRisk}</p>
        </div>
      </div>

      {/* Time Range Filter */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-400">Time Range:</span>
        <div className="flex gap-2">
          {[1, 6, 12, 24, 48, 168].map(hours => (
            <button
              key={hours}
              onClick={() => setTimeRange(hours)}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${
                timeRange === hours
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {hours < 24 ? `${hours}h` : `${hours / 24}d`}
            </button>
          ))}
        </div>
      </div>

      {/* Earthquakes List */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-lg">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-semibold">Recent Earthquakes</h2>
        </div>

        <div className="divide-y divide-gray-800">
          {isLoading && (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent 
                            rounded-full mx-auto mb-4"></div>
              <p className="text-gray-400">Loading earthquake data...</p>
            </div>
          )}

          {error && (
            <div className="text-red-400 p-6 bg-red-500/10">
              Failed to load earthquakes. Make sure API Gateway is running.
            </div>
          )}

          {!isLoading && !error && earthquakes?.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              No earthquakes detected in the last {timeRange} hours
            </div>
          )}

          {earthquakes?.map((quake) => (
            <div key={quake.earthquakeId} className="p-6 hover:bg-gray-800/50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Magnitude Badge */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`px-3 py-1 rounded-lg border font-bold ${getMagnitudeColor(quake.magnitude)}`}>
                      M {quake.magnitude.toFixed(1)}
                    </div>
                    <span className="text-sm text-gray-400">
                      {getMagnitudeLabel(quake.magnitude)}
                    </span>
                    {quake.tsunamiRiskScore && quake.tsunamiRiskScore > 50 && (
                      <span className="px-2 py-1 rounded bg-purple-500/10 border border-purple-500 
                                     text-purple-400 text-xs font-semibold">
                        🌊 TSUNAMI RISK
                      </span>
                    )}
                  </div>

                  {/* Location */}
                  <div className="flex items-start gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    <p className="text-gray-200">{quake.location}</p>
                  </div>

                  {/* Details */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                    {quake.latitude != null && quake.longitude != null && (
                      <span>📍 {quake.latitude.toFixed(2)}°, {quake.longitude.toFixed(2)}°</span>
                    )}
                    {quake.depth != null && (
                      <span>⬇️ Depth: {quake.depth.toFixed(1)} km</span>
                    )}
                    {quake.tsunamiRiskScore != null && (
                      <span>🌊 Risk: {quake.tsunamiRiskScore.toFixed(0)}%</span>
                    )}
                    {quake.timestamp && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(quake.timestamp), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                {quake.url && (
                  <a
                    href={quake.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm 
                             transition-colors"
                  >
                    USGS Details →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
