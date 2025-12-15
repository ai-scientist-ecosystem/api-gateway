'use client';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: string;
  trend?: string;
  color?: string;
  subtitle?: string;
}

export default function StatsCard({ title, value, icon, trend, color = 'blue', subtitle }: StatsCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500/10 border-blue-500/20',
    red: 'bg-red-500/10 border-red-500/20',
    yellow: 'bg-yellow-500/10 border-yellow-500/20',
    green: 'bg-green-500/10 border-green-500/20',
    cyan: 'bg-cyan-500/10 border-cyan-500/20',
  };

  return (
    <div className={`border rounded-lg p-6 ${colorClasses[color as keyof typeof colorClasses] || colorClasses.blue}`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-3xl">{icon}</span>
        {trend && (
          <span className="text-sm text-green-400">↑ {trend}</span>
        )}
      </div>
      <h3 className="text-sm text-gray-400 mb-1">{title}</h3>
      <p className="text-3xl font-bold text-white">{value}</p>
      {subtitle && (
        <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
      )}
    </div>
  );
}
