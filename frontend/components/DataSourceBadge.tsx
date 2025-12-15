import { ExternalLink, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface DataSourceBadgeProps {
  source: 'noaa' | 'usgs' | 'nasa';
  timestamp?: string;
  verifyUrl?: string;
  className?: string;
}

const sourceConfig = {
  noaa: {
    name: 'NOAA',
    fullName: 'National Oceanic and Atmospheric Administration',
    logo: '🌊',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    defaultUrl: 'https://www.noaa.gov/'
  },
  usgs: {
    name: 'USGS',
    fullName: 'U.S. Geological Survey',
    logo: '🌍',
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20',
    defaultUrl: 'https://www.usgs.gov/'
  },
  nasa: {
    name: 'NASA',
    fullName: 'National Aeronautics and Space Administration',
    logo: '🚀',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
    defaultUrl: 'https://www.nasa.gov/'
  }
};

export default function DataSourceBadge({ source, timestamp, verifyUrl, className = '' }: DataSourceBadgeProps) {
  const config = sourceConfig[source];
  
  // Calculate data freshness
  const getFreshnessIndicator = () => {
    if (!timestamp) return null;
    
    const now = new Date();
    const dataTime = new Date(timestamp);
    const minutesAgo = (now.getTime() - dataTime.getTime()) / 1000 / 60;
    
    if (minutesAgo < 1) {
      return { icon: CheckCircle, color: 'text-green-400', label: 'Live' };
    } else if (minutesAgo < 5) {
      return { icon: Clock, color: 'text-green-400', label: `${Math.floor(minutesAgo)}m ago` };
    } else if (minutesAgo < 30) {
      return { icon: Clock, color: 'text-yellow-400', label: `${Math.floor(minutesAgo)}m ago` };
    } else {
      return { icon: AlertCircle, color: 'text-orange-400', label: `${Math.floor(minutesAgo)}m ago` };
    }
  };
  
  const freshness = getFreshnessIndicator();
  const FreshnessIcon = freshness?.icon;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Source Badge */}
      <div className={`flex items-center gap-2 px-2 py-1 rounded-md border ${config.bgColor} ${config.borderColor}`}>
        <span className="text-base">{config.logo}</span>
        <div className="flex flex-col">
          <span className={`text-xs font-semibold ${config.color}`}>
            {config.name}
          </span>
          <span className="text-[10px] text-gray-500">
            {config.fullName}
          </span>
        </div>
      </div>

      {/* Freshness Indicator */}
      {freshness && FreshnessIcon && (
        <div className="flex items-center gap-1">
          <FreshnessIcon className={`w-3 h-3 ${freshness.color}`} />
          <span className={`text-xs ${freshness.color}`}>
            {freshness.label}
          </span>
        </div>
      )}

      {/* Verify Link */}
      {verifyUrl && (
        <a
          href={verifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
        >
          <span>Verify</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </div>
  );
}
