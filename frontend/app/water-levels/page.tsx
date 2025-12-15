'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Waves, MapPin, Clock, AlertTriangle, Droplets } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import DataSourceBadge from '@/components/DataSourceBadge';
import WaterLevelMap from '@/components/WaterLevelMap';

interface WaterLevelData {
  id: number;
  stationId: string;
  stationName: string;
  source: string;
  locationType: string;
  waterLevelFeet?: number;
  waterLevelMeters?: number;
  gageHeightFeet?: number;
  floodStageFeet?: number;
  actionStageFeet?: number;
  minorFloodStageFeet?: number;
  moderateFloodStageFeet?: number;
  majorFloodStageFeet?: number;
  latitude?: number;
  longitude?: number;
  timestamp: string;
  processedAt: string;
}

interface FloodingStation {
  stationId: string;
  stationName: string;
  currentLevel: number;
  floodStage: number;
  severity: string;
  aboveFloodStage: number;
}

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function WaterLevelsPage() {
  const [locationType, setLocationType] = useState<'all' | 'ocean' | 'river'>('all');
  const [view, setView] = useState<'list' | 'map'>('list');

  const { data: floodingStations, error: floodError } = useSWR<FloodingStation[]>(
    'http://localhost:8085/api/data-collector/api/v1/water-level/flooding',
    fetcher,
    {
      refreshInterval: 60000,
      fallbackData: [],
    }
  );

  const { data: allStations } = useSWR<WaterLevelData[]>(
    'http://localhost:8085/api/data-collector/api/v1/water-level/stations',
    fetcher,
    {
      refreshInterval: 120000,
      fallbackData: [],
    }
  );

  const { data: stats } = useSWR(
    'http://localhost:8085/api/data-collector/api/v1/water-level/stats',
    fetcher,
    {
      refreshInterval: 120000,
      fallbackData: { noaaStations: 0, usgsStations: 0, activeStations: 0, currentlyFlooding: 0 },
    }
  );

  const getSeverityColor = (severity: string) => {
    const sev = severity?.toUpperCase();
    if (sev === 'MAJOR') return 'text-red-500 bg-red-500/10 border-red-500';
    if (sev === 'MODERATE') return 'text-orange-500 bg-orange-500/10 border-orange-500';
    if (sev === 'MINOR') return 'text-yellow-500 bg-yellow-500/10 border-yellow-500';
    if (sev === 'ACTION') return 'text-blue-500 bg-blue-500/10 border-blue-500';
    return 'text-gray-500 bg-gray-500/10 border-gray-500';
  };

  const getSeverityIcon = (severity: string) => {
    const sev = severity?.toUpperCase();
    if (sev === 'MAJOR' || sev === 'MODERATE') return '🚨';
    if (sev === 'MINOR') return '⚠️';
    if (sev === 'ACTION') return '📢';
    return '💧';
  };

  const filteredStations = locationType === 'all' 
    ? floodingStations 
    : floodingStations?.filter(s => {
        // Filter based on station ID patterns
        if (locationType === 'ocean') {
          // NOAA stations typically have numeric IDs
          return /^\d+$/.test(s.stationId);
        } else {
          // USGS stations typically have alphanumeric IDs
          return /[a-zA-Z]/.test(s.stationId);
        }
      });

  const floodStats = {
    total: (stats?.noaaStations || 0) + (stats?.usgsStations || 0),
    active: stats?.activeStations || 0,
    flooding: floodingStations?.length || 0,
    major: floodingStations?.filter(s => s.severity?.toUpperCase() === 'MAJOR').length || 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">🌊 Water Level Monitoring</h1>
        <p className="text-gray-400 mb-3">
          Real-time water levels from NOAA (oceans) and USGS (rivers)
        </p>
        <div className="flex flex-wrap gap-3">
          <DataSourceBadge 
            source="noaa" 
            timestamp={stats?.timestamp}
            verifyUrl="https://tidesandcurrents.noaa.gov/"
          />
          <DataSourceBadge 
            source="usgs" 
            timestamp={stats?.timestamp}
            verifyUrl="https://waterdata.usgs.gov/nwis/rt"
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <Waves className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-sm text-gray-400 mb-1">Total Stations</h3>
          <p className="text-3xl font-bold text-white">{floodStats.total}</p>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <Droplets className="w-8 h-8 text-green-400" />
          </div>
          <h3 className="text-sm text-gray-400 mb-1">Active Monitoring</h3>
          <p className="text-3xl font-bold text-white">{floodStats.active}</p>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <AlertTriangle className="w-8 h-8 text-yellow-400" />
          </div>
          <h3 className="text-sm text-gray-400 mb-1">Flooding Now</h3>
          <p className="text-3xl font-bold text-white">{floodStats.flooding}</p>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-sm text-gray-400 mb-1">Major Flooding</h3>
          <p className="text-3xl font-bold text-white">{floodStats.major}</p>
        </div>
      </div>

      {/* Filters & View Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex gap-4">
          <button
            onClick={() => setLocationType('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              locationType === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            All Stations
          </button>
          <button
            onClick={() => setLocationType('ocean')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              locationType === 'ocean'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            🌊 Ocean/Coast
          </button>
          <button
            onClick={() => setLocationType('river')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              locationType === 'river'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            🏞️ Rivers/Streams
          </button>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setView('list')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              view === 'list'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            📋 List
          </button>
          <button
            onClick={() => setView('map')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              view === 'map'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            🗺️ Map
          </button>
        </div>
      </div>

      {/* Map View */}
      {view === 'map' && allStations && (
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
          <WaterLevelMap 
            stations={allStations}
            floodingStations={floodingStations || []}
            className="h-[600px]"
          />
        </div>
      )}

      {/* Flooding Stations List */}
      {view === 'list' && (
      <div className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold">
            {floodStats.flooding > 0 
              ? `⚠️ Stations Currently Flooding (${filteredStations?.length || 0})`
              : '✅ No Flooding Detected'}
          </h2>
        </div>

        {filteredStations && filteredStations.length > 0 ? (
          <div className="divide-y divide-gray-800">
            {filteredStations.map((station) => (
              <div 
                key={station.stationId}
                className="p-6 hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{getSeverityIcon(station.severity)}</span>
                      <h3 className="text-lg font-semibold text-white">
                        {station.stationName}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(station.severity)}`}>
                        {station.severity?.toUpperCase() || 'UNKNOWN'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">Station ID: {station.stationId}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400 mb-1">Current Level</p>
                    <p className="text-white font-semibold">
                      {station.currentLevel?.toFixed(2)} ft
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Flood Stage</p>
                    <p className="text-white font-semibold">
                      {station.floodStage?.toFixed(2)} ft
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Above Flood Stage</p>
                    <p className="text-red-400 font-semibold">
                      +{station.aboveFloodStage?.toFixed(2)} ft
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Severity</p>
                    <p className={`font-semibold ${
                      station.severity?.toUpperCase() === 'MAJOR' ? 'text-red-400' :
                      station.severity?.toUpperCase() === 'MODERATE' ? 'text-orange-400' :
                      station.severity?.toUpperCase() === 'MINOR' ? 'text-yellow-400' :
                      'text-blue-400'
                    }`}>
                      {station.severity?.toUpperCase()}
                    </p>
                  </div>
                </div>

                {station.severity?.toUpperCase() === 'MAJOR' && (
                  <div className="mt-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
                    <p className="text-red-400 text-sm">
                      <strong>⚠️ MAJOR FLOODING:</strong> Extensive property damage likely. Evacuate if instructed by local authorities.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <Waves className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg mb-2">No flooding detected</p>
            <p className="text-gray-500 text-sm">
              {floodStats.active > 0 
                ? `${floodStats.active} stations actively monitoring water levels`
                : 'Water level monitoring is active'}
            </p>
          </div>
        )}
      </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <Droplets className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-blue-400 mb-2">About Flood Stages</h3>
            <div className="text-sm text-gray-300 space-y-1">
              <p><strong className="text-blue-400">ACTION:</strong> Water level approaching flood stage. Prepare for possible flooding.</p>
              <p><strong className="text-yellow-400">MINOR:</strong> Minimal flooding of low-lying areas. Some roads may be closed.</p>
              <p><strong className="text-orange-400">MODERATE:</strong> Some property damage. Evacuations may be needed.</p>
              <p><strong className="text-red-400">MAJOR:</strong> Extensive property damage. Significant evacuations likely.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
