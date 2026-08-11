import type { ResilienceMetrics } from '../types/resilience';

export const MetricsCard = ({ metrics }: { metrics: ResilienceMetrics | null }) => {
  const metricItems = [
    { label: 'Failed Calls', value: metrics ? metrics.failedCalls : '--', color: 'text-rose-400' },
    { label: 'Not Permitted', value: metrics ? metrics.notPermittedCalls : '--', color: 'text-amber-400' },
    { label: 'Retries', value: metrics ? metrics.retryCalls : '--', color: 'text-indigo-400' },
    { label: 'Timeouts', value: metrics ? metrics.timeoutCalls : '--', color: 'text-orange-400' },
    { label: 'RateLimit Avail.', value: metrics ? metrics.rateLimiterAvailable : '--', color: 'text-emerald-400' },
    { label: 'Bulkhead Avail.', value: metrics ? metrics.bulkheadAvailable : '--', color: 'text-cyan-400' }
  ];

  return (
    <div className="bg-slate-800/80 backdrop-blur-md rounded-xl p-6 border border-slate-700/50 shadow-lg shadow-black/20 h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-100">Resilience Metrics</h2>
        <p className="text-sm text-slate-400 mt-1">
          {metrics ? 'Live Actuator Statistics' : 'Live Actuator metrics available in local development only.'}
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 flex-grow">
        {metricItems.map((item, index) => (
          <div key={index} className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50 flex flex-col justify-center items-center text-center hover:bg-slate-700/30 transition-colors">
            <p className="text-xs text-slate-400 mb-2 uppercase tracking-wider">{item.label}</p>
            <p className={`text-3xl font-mono font-bold ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
