import type { ResilienceMetrics } from '../types/resilience';

interface CircuitBreakerCardProps {
  metrics: ResilienceMetrics | null;
}

export const CircuitBreakerCard = ({ metrics }: CircuitBreakerCardProps) => {
  const getBadgeColor = (stateValue: number) => {
    switch (stateValue) {
      case 0: return 'bg-green-500 shadow-green-500/50';
      case 1: return 'bg-red-500 shadow-red-500/50 animate-pulse';
      case 2: return 'bg-yellow-500 shadow-yellow-500/50';
      default: return 'bg-gray-400';
    }
  };

  const getStateText = (stateValue: number) => {
    switch (stateValue) {
      case 0: return 'CLOSED';
      case 1: return 'OPEN';
      case 2: return 'HALF_OPEN';
      default: return 'UNKNOWN';
    }
  };

  const stateValue = metrics?.circuitBreakerStateValue ?? -1;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100 flex flex-col h-full">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Circuit Breaker</h2>
      <p className="text-sm text-gray-500 mb-6">Recommendation Service</p>
      
      <div className="flex flex-col items-center justify-center flex-grow mb-6">
        <div className={`w-32 h-32 rounded-full shadow-lg flex items-center justify-center text-white text-xl font-bold mb-4 transition-all duration-300 ${getBadgeColor(stateValue)}`}>
          {getStateText(stateValue)}
        </div>
        <p className="text-gray-600 font-medium">Current State</p>
      </div>
      
      <div className="bg-gray-50 rounded-md p-4 mt-auto">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Failure Rate</span>
          <span className="font-semibold text-gray-800">{metrics ? metrics.failureRate.toFixed(1) : 0}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${Math.min(metrics?.failureRate || 0, 100)}%` }}></div>
        </div>
      </div>
    </div>
  );
};
