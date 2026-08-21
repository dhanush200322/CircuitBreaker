import type { ResilienceMetrics } from '../types/resilience';

const MetricTile = ({
  label,
  value,
  color,
  tooltip,
}: {
  label: string;
  value: string | number;
  color: string;
  tooltip: string;
}) => (
  <div
    title={tooltip}
    className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50 flex flex-col justify-center items-center text-center hover:bg-slate-700/30 transition-colors cursor-default"
  >
    <p className="text-xs text-slate-400 mb-2 uppercase tracking-wider">{label}</p>
    <p className={`text-3xl font-mono font-bold ${color}`}>{value}</p>
  </div>
);

export const MetricsCard = ({ metrics }: { metrics: ResilienceMetrics | null }) => {
  const v = (val: number | undefined) => (val != null ? val : '--');

  const metricItems = [
    {
      label: 'Failed Calls',
      value: v(metrics?.failedCalls),
      color: 'text-rose-400',
      tooltip: 'Total number of calls that threw an exception inside the circuit breaker window',
    },
    {
      label: 'Not Permitted',
      value: v(metrics?.notPermittedCalls),
      color: 'text-amber-400',
      tooltip: 'Calls rejected because the circuit breaker is OPEN (fail-fast)',
    },
    {
      label: 'Retries',
      value: v(metrics?.retryCalls),
      color: 'text-indigo-400',
      tooltip: 'Calls that were automatically retried after a failure by Resilience4j Retry',
    },
    {
      label: 'Timeouts',
      value: v(metrics?.timeoutCalls),
      color: 'text-orange-400',
      tooltip: 'Calls cancelled because they exceeded the TimeLimiter threshold (2 s)',
    },
    {
      label: 'RateLimit Avail.',
      value: v(metrics?.rateLimiterAvailable),
      color: 'text-emerald-400',
      tooltip: 'Available permits remaining in the current rate-limiter window',
    },
    {
      label: 'Bulkhead Avail.',
      value: v(metrics?.bulkheadAvailable),
      color: 'text-cyan-400',
      tooltip: 'Available concurrent call slots in the bulkhead (max 1 concurrent call)',
    },
  ];

  return (
    <div className="bg-slate-800/80 backdrop-blur-md rounded-xl p-6 border border-slate-700/50 shadow-lg shadow-black/20 h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-100">Resilience Metrics</h2>
        <p className="text-sm text-slate-400 mt-1">
          {metrics ? 'Live Actuator Statistics — hover a tile for details' : 'Waiting for backend metrics…'}
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 flex-grow">
        {metricItems.map((item) => (
          <MetricTile key={item.label} {...item} />
        ))}
      </div>
    </div>
  );
};
