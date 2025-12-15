'use client';

import { Alert } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

interface AlertCardProps {
  alert: Alert;
}

const severityColors = {
  EXTREME: 'bg-red-500/10 border-red-500 text-red-500',
  SEVERE: 'bg-orange-500/10 border-orange-500 text-orange-500',
  STRONG: 'bg-yellow-500/10 border-yellow-500 text-yellow-500',
  MODERATE: 'bg-blue-500/10 border-blue-500 text-blue-500',
  MINOR: 'bg-green-500/10 border-green-500 text-green-500',
  WARNING: 'bg-purple-500/10 border-purple-500 text-purple-500',
};

export default function AlertCard({ alert }: AlertCardProps) {
  const colorClass = severityColors[alert.severity] || severityColors.MODERATE;
  
  return (
    <div className={`border-l-4 p-4 rounded-lg ${colorClass} bg-opacity-50`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-1 rounded text-xs font-semibold ${colorClass}`}>
              {alert.severity}
            </span>
            <span className="text-sm text-gray-400">
              {alert.alertType.replace(/_/g, ' ')}
            </span>
          </div>
          
          <p className="text-sm text-gray-200 mb-2 line-clamp-2">
            {alert.description}
          </p>
          
          <div className="flex items-center gap-4 text-xs text-gray-400">
            {alert.location && (
              <span>📍 {alert.location}</span>
            )}
            {alert.magnitude && (
              <span>🔴 M{alert.magnitude}</span>
            )}
            {alert.kpValue && (
              <span>⚡ Kp {alert.kpValue}</span>
            )}
            <span className="ml-auto">
              {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
