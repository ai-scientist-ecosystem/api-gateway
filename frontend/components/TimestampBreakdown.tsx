import { Clock, Database, Cpu, Eye, CheckCircle } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

interface TimestampBreakdownProps {
  measured?: string;
  ingested?: string;
  processed?: string;
  displayed?: string;
  className?: string;
}

export default function TimestampBreakdown({ 
  measured, 
  ingested, 
  processed, 
  displayed, 
  className = '' 
}: TimestampBreakdownProps) {
  
  const calculateLatency = (start?: string, end?: string) => {
    if (!start || !end) return null;
    const diff = new Date(end).getTime() - new Date(start).getTime();
    return diff > 0 ? diff : null;
  };

  const formatLatency = (ms: number | null) => {
    if (ms === null) return 'N/A';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const stages = [
    {
      icon: Clock,
      label: 'Measured',
      timestamp: measured,
      description: 'Data collected by sensor',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      icon: Database,
      label: 'Ingested',
      timestamp: ingested,
      description: 'Received by data collector',
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      latency: calculateLatency(measured, ingested),
    },
    {
      icon: Cpu,
      label: 'Processed',
      timestamp: processed,
      description: 'Analyzed by alert engine',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      latency: calculateLatency(ingested, processed),
    },
    {
      icon: Eye,
      label: 'Displayed',
      timestamp: displayed || new Date().toISOString(),
      description: 'Shown to user',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      latency: calculateLatency(processed, displayed || new Date().toISOString()),
    },
  ];

  const totalLatency = calculateLatency(measured, displayed || new Date().toISOString());

  return (
    <div className={`bg-gray-900/50 border border-gray-800 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-gray-300">Data Pipeline Timeline</h4>
        {totalLatency !== null && (
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-xs text-green-400">
              Total: {formatLatency(totalLatency)}
            </span>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {stages.map((stage, index) => {
          const Icon = stage.icon;
          const isCompleted = stage.timestamp !== undefined;
          
          return (
            <div key={stage.label} className="relative">
              {/* Connecting line */}
              {index < stages.length - 1 && (
                <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-700" />
              )}

              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={`relative z-10 p-2 rounded-full ${stage.bgColor} border border-gray-700`}>
                  <Icon className={`w-4 h-4 ${stage.color}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className={`text-sm font-medium ${stage.color}`}>
                        {stage.label}
                      </p>
                      <p className="text-xs text-gray-500">
                        {stage.description}
                      </p>
                    </div>
                    
                    {isCompleted && stage.timestamp && (
                      <div className="text-right">
                        <p className="text-xs text-gray-400">
                          {format(new Date(stage.timestamp), 'HH:mm:ss')}
                        </p>
                        <p className="text-xs text-gray-600">
                          {formatDistanceToNow(new Date(stage.timestamp), { addSuffix: true })}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Latency indicator */}
                  {stage.latency !== null && stage.latency !== undefined && (
                    <div className="mt-1 text-xs text-gray-500">
                      ⚡ {formatLatency(stage.latency)} processing time
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Performance indicator */}
      {totalLatency !== null && (
        <div className="mt-4 pt-4 border-t border-gray-800">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Pipeline Performance:</span>
            <span className={`font-semibold ${
              totalLatency < 1000 ? 'text-green-400' :
              totalLatency < 5000 ? 'text-yellow-400' :
              'text-orange-400'
            }`}>
              {totalLatency < 1000 ? '🚀 Excellent' :
               totalLatency < 5000 ? '⚡ Good' :
               '⏱️ Acceptable'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
