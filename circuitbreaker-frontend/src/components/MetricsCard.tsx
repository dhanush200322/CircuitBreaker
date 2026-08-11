import type { ResilienceMetrics } from '../types/resilience';

export const MetricsCard = ({ metrics }: { metrics: ResilienceMetrics | null }) => {
  if (!metrics) return null;

  const metricItems = [
    { label: 'Failed Calls', value: metrics.failedCalls, color: 'text-red-600' },
    { label: 'Not Permitted', value: metrics.notPermittedCalls, color: 'text-orange-600' },
    { label: 'Retries Triggered', value: metrics.retryCalls, color: 'text-blue-600' },
    { label: 'Timeouts', value: metrics.timeoutCalls, color: 'text-yellow-600' },
    { label: 'RateLimit Avail.', value: metrics.rateLimiterAvailable, color: 'text-green-600' },
    { label: 'Bulkhead Avail.', value: metrics.bulkheadAvailable, color: 'text-indigo-600' }
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Resilience Metrics</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {metricItems.map((item, index) => (
          <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">{item.label}</p>
            <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
