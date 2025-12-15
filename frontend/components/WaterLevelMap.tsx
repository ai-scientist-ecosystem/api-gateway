'use client';

import { useState, useMemo } from 'react';
import Map, { Marker, Popup, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Waves, MapPin } from 'lucide-react';

interface Station {
  stationId: string;
  stationName: string;
  latitude: number;
  longitude: number;
  locationType: string;
  currentLevel?: number;
  floodStage?: number;
  severity?: string;
  aboveFloodStage?: number;
}

interface WaterLevelMapProps {
  stations: Station[];
  floodingStations: any[];
  className?: string;
}

export default function WaterLevelMap({ stations, floodingStations, className = '' }: WaterLevelMapProps) {
  const [popupInfo, setPopupInfo] = useState<Station | null>(null);
  const [viewState, setViewState] = useState({
    latitude: 39.8283, // Center of US
    longitude: -98.5795,
    zoom: 3.5,
  });

  // Free Mapbox token (limited usage - replace with your own for production)
  const MAPBOX_TOKEN = 'pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjbGV4YW1wbGUifQ.example' || 
    'pk.eyJ1IjoidGVzdCIsImEiOiJjbGV4YW1wbGUifQ.example';

  const getSeverityColor = (severity?: string) => {
    if (!severity) return '#3B82F6'; // blue
    const sev = severity.toUpperCase();
    if (sev === 'MAJOR') return '#EF4444'; // red
    if (sev === 'MODERATE') return '#F97316'; // orange
    if (sev === 'MINOR') return '#EAB308'; // yellow
    if (sev === 'ACTION') return '#3B82F6'; // blue
    return '#6B7280'; // gray
  };

  const getMarkerSize = (severity?: string) => {
    if (!severity) return 20;
    const sev = severity?.toUpperCase();
    if (sev === 'MAJOR') return 32;
    if (sev === 'MODERATE') return 28;
    if (sev === 'MINOR') return 24;
    return 20;
  };

  // Merge station data with flooding status
  const enrichedStations = useMemo(() => {
    return stations.map(station => {
      const floodInfo = floodingStations?.find(
        f => f.stationId === station.stationId
      );
      return {
        ...station,
        ...floodInfo,
      };
    });
  }, [stations, floodingStations]);

  // Separate NOAA and USGS stations
  const noaaStations = enrichedStations.filter(s => s.locationType === 'ocean');
  const usgsStations = enrichedStations.filter(s => s.locationType === 'river');

  return (
    <div className={`relative ${className}`}>
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        style={{ width: '100%', height: '100%', borderRadius: '0.5rem' }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
      >
        <NavigationControl position="top-right" />

        {/* NOAA Ocean Stations */}
        {noaaStations.map((station) => (
          <Marker
            key={`noaa-${station.stationId}`}
            latitude={station.latitude}
            longitude={station.longitude}
            onClick={e => {
              e.originalEvent.stopPropagation();
              setPopupInfo(station);
            }}
          >
            <div
              className="cursor-pointer hover:scale-110 transition-transform"
              style={{
                width: getMarkerSize(station.severity),
                height: getMarkerSize(station.severity),
                borderRadius: '50%',
                backgroundColor: getSeverityColor(station.severity),
                border: '2px solid white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              }}
            >
              <Waves className="w-3 h-3 text-white" />
            </div>
          </Marker>
        ))}

        {/* USGS River Stations */}
        {usgsStations.map((station) => (
          <Marker
            key={`usgs-${station.stationId}`}
            latitude={station.latitude}
            longitude={station.longitude}
            onClick={e => {
              e.originalEvent.stopPropagation();
              setPopupInfo(station);
            }}
          >
            <div
              className="cursor-pointer hover:scale-110 transition-transform"
              style={{
                width: getMarkerSize(station.severity),
                height: getMarkerSize(station.severity),
                borderRadius: '50%',
                backgroundColor: getSeverityColor(station.severity),
                border: '2px solid white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              }}
            >
              <MapPin className="w-3 h-3 text-white" />
            </div>
          </Marker>
        ))}

        {/* Popup */}
        {popupInfo && (
          <Popup
            latitude={popupInfo.latitude}
            longitude={popupInfo.longitude}
            onClose={() => setPopupInfo(null)}
            closeButton={true}
            closeOnClick={false}
            offset={15}
            className="water-level-popup"
          >
            <div className="p-2 min-w-[200px]">
              <div className="flex items-center gap-2 mb-2">
                {popupInfo.locationType === 'ocean' ? (
                  <Waves className="w-4 h-4 text-blue-400" />
                ) : (
                  <MapPin className="w-4 h-4 text-green-400" />
                )}
                <h3 className="font-semibold text-sm">{popupInfo.stationName}</h3>
              </div>
              
              <div className="text-xs text-gray-600 space-y-1">
                <div className="flex justify-between">
                  <span>Station ID:</span>
                  <span className="font-mono">{popupInfo.stationId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Type:</span>
                  <span className="capitalize">{popupInfo.locationType}</span>
                </div>
                
                {popupInfo.currentLevel !== undefined && (
                  <>
                    <div className="flex justify-between">
                      <span>Current Level:</span>
                      <span className="font-semibold">{popupInfo.currentLevel.toFixed(2)} ft</span>
                    </div>
                    {popupInfo.floodStage && (
                      <div className="flex justify-between">
                        <span>Flood Stage:</span>
                        <span>{popupInfo.floodStage.toFixed(2)} ft</span>
                      </div>
                    )}
                    {popupInfo.aboveFloodStage !== undefined && popupInfo.aboveFloodStage > 0 && (
                      <div className="flex justify-between text-red-600 font-semibold">
                        <span>Above Flood:</span>
                        <span>+{popupInfo.aboveFloodStage.toFixed(2)} ft</span>
                      </div>
                    )}
                  </>
                )}
                
                {popupInfo.severity && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <span
                      className="px-2 py-1 rounded text-xs font-semibold"
                      style={{
                        backgroundColor: getSeverityColor(popupInfo.severity) + '20',
                        color: getSeverityColor(popupInfo.severity),
                      }}
                    >
                      {popupInfo.severity.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </Popup>
        )}
      </Map>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-gray-900/90 border border-gray-700 rounded-lg p-3 text-xs">
        <h4 className="font-semibold mb-2 text-gray-300">Legend</h4>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500 border border-white" />
            <span className="text-gray-400">Major Flooding</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-orange-500 border border-white" />
            <span className="text-gray-400">Moderate Flooding</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-yellow-500 border border-white" />
            <span className="text-gray-400">Minor Flooding</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500 border border-white" />
            <span className="text-gray-400">Normal / Action</span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-700 space-y-1">
          <div className="flex items-center gap-2">
            <Waves className="w-3 h-3 text-blue-400" />
            <span className="text-gray-400">NOAA Ocean/Coast</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3 h-3 text-green-400" />
            <span className="text-gray-400">USGS Rivers</span>
          </div>
        </div>
      </div>

      {/* Stats Overlay */}
      <div className="absolute top-4 left-4 bg-gray-900/90 border border-gray-700 rounded-lg p-3">
        <div className="text-xs space-y-1">
          <div className="font-semibold text-gray-300 mb-2">Stations</div>
          <div className="flex justify-between gap-4 text-gray-400">
            <span>NOAA (Ocean):</span>
            <span className="font-semibold text-blue-400">{noaaStations.length}</span>
          </div>
          <div className="flex justify-between gap-4 text-gray-400">
            <span>USGS (Rivers):</span>
            <span className="font-semibold text-green-400">{usgsStations.length}</span>
          </div>
          <div className="flex justify-between gap-4 text-gray-400 pt-2 border-t border-gray-700">
            <span>Total:</span>
            <span className="font-semibold text-white">{enrichedStations.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
