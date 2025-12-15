'use client';

interface ServiceStatusProps {
  service: string;
  status: 'UP' | 'DOWN' | 'DEGRADED';
  instances?: number;
}

export default function ServiceStatus({ service, status, instances = 1 }: ServiceStatusProps) {
  const statusColors = {
    UP: 'bg-green-500',
    DOWN: 'bg-red-500',
    DEGRADED: 'bg-yellow-500',
  };

  const statusDot = statusColors[status] || statusColors.DOWN;

  return (
    <div className="flex items-center justify-between p-3 border border-gray-700 rounded-lg hover:border-gray-600 transition-colors">
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${statusDot} animate-pulse`} />
        <span className="text-sm font-medium text-gray-200">{service}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400">{instances} instance{instances > 1 ? 's' : ''}</span>
        <span className={`text-xs px-2 py-1 rounded ${status === 'UP' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          {status}
        </span>
      </div>
    </div>
  );
}
