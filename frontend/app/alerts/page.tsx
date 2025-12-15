'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Alert } from '@/lib/types';
import AlertCard from '@/components/AlertCard';
import { Filter, Search } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function AlertsPage() {
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: alerts, error, isLoading } = useSWR<Alert[]>(
    'http://localhost:8085/api/alerts',
    fetcher,
    {
      refreshInterval: 10000, // Refresh every 10 seconds
      fallbackData: [],
    }
  );

  const filteredAlerts = alerts?.filter(alert => {
    const matchesSeverity = severityFilter === 'ALL' || alert.severity === severityFilter;
    const matchesSearch = searchQuery === '' || 
      alert.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.alertType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.location?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSeverity && matchesSearch;
  }) || [];

  const severities = ['ALL', 'EXTREME', 'SEVERE', 'STRONG', 'MODERATE', 'MINOR'];
  const alertCountBySeverity = severities.reduce((acc, sev) => {
    if (sev === 'ALL') {
      acc[sev] = alerts?.length || 0;
    } else {
      acc[sev] = alerts?.filter(a => a.severity === sev).length || 0;
    }
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">All Alerts</h1>
        <p className="text-gray-400">
          Comprehensive view of all disaster alerts and warnings
        </p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {severities.map(sev => (
          <button
            key={sev}
            onClick={() => setSeverityFilter(sev)}
            className={`p-4 rounded-lg border transition-all ${
              severityFilter === sev
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-gray-700 hover:border-gray-600'
            }`}
          >
            <div className="text-2xl font-bold">{alertCountBySeverity[sev]}</div>
            <div className="text-xs text-gray-400 mt-1">{sev}</div>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search alerts by description, type, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg 
                     text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 
                     focus:border-blue-500 focus:outline-none"
          >
            {severities.map(sev => (
              <option key={sev} value={sev}>{sev}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Summary */}
      <div className="text-sm text-gray-400">
        Showing <span className="text-white font-semibold">{filteredAlerts.length}</span> of{' '}
        <span className="text-white font-semibold">{alerts?.length || 0}</span> alerts
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent 
                          rounded-full mx-auto mb-4"></div>
            <p className="text-gray-400">Loading alerts...</p>
          </div>
        )}

        {error && (
          <div className="text-red-400 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            Failed to load alerts. Make sure API Gateway is running on port 8085.
          </div>
        )}

        {!isLoading && !error && filteredAlerts.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            {searchQuery || severityFilter !== 'ALL' ? (
              <>No alerts match your filters</>
            ) : (
              <>No alerts available. Collecting data from NASA/NOAA/USGS...</>
            )}
          </div>
        )}

        {filteredAlerts.map((alert) => (
          <AlertCard key={alert.id} alert={alert} />
        ))}
      </div>
    </div>
  );
}
