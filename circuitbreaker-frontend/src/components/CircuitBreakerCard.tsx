import type { ResilienceMetrics } from '../types/resilience';

interface CircuitBreakerCardProps {
  metrics: ResilienceMetrics | null;
}

export const CircuitBreakerCard = ({ metrics }: CircuitBreakerCardProps) => {
  const isLocalOnly = metrics === null;

  const getBadgeStyle = (stateValue: number) => {
    if (isLocalOnly) {
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.2)]';
    }
    switch (stateValue) {
      case 0: return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]';
      case 1: return 'bg-rose-500/10 text-rose-400 border-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.3)] animate-pulse';
      case 2: return 'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.2)]';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  const getIndicatorColor = (stateValue: number) => {
    if (isLocalOnly) {
      return 'bg-amber-500';
    }
    switch (stateValue) {
      case 0: return 'bg-emerald-500';
      case 1: return 'bg-rose-500';
      case 2: return 'bg-amber-500';
      default: return 'bg-slate-500';
    }
  };

  const getStateText = (stateValue: number) => {
    if (isLocalOnly) {
      return 'LOCAL ONLY';
    }
    switch (stateValue) {
      case 0: return 'CLOSED';
      case 1: return 'OPEN';
      case 2: return 'HALF_OPEN';
      default: return 'UNKNOWN';
    }
  };

  const stateValue = metrics?.circuitBreakerStateValue ?? -1;

  return (
    <div className="bg-slate-800/80 backdrop-blur-md rounded-xl p-6 border border-slate-700/50 flex flex-col h-full shadow-lg shadow-black/20">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-100">Circuit Breaker</h2>
        <p className="text-sm text-slate-400 font-mono mt-1">Recommendation Service</p>
      </div>
      
      <div className="flex flex-col items-center justify-center flex-grow mb-8 mt-4">
        <div className={`px-8 py-4 rounded-full border-2 flex items-center gap-3 transition-all duration-300 ${getBadgeStyle(stateValue)}`}>
          <span className={`w-3 h-3 rounded-full shadow-[0_0_8px_currentColor] ${getIndicatorColor(stateValue)}`}></span>
          <span className="text-2xl font-bold tracking-widest">{getStateText(stateValue)}</span>
        </div>
        {isLocalOnly && (
          <p className="text-xs text-amber-400/80 italic mt-3 text-center">
            Live Actuator metrics available in local development only.
          </p>
        )}
      </div>
      
      <div className="grid grid-cols-3 gap-4 bg-slate-900/50 rounded-lg p-4 border border-slate-700/50 mt-auto">
        <div className="flex flex-col items-center justify-center text-center">
          <span className="text-xs text-slate-400 mb-1 uppercase tracking-wider">Failure Rate</span>
          <span className="font-mono text-lg font-semibold text-slate-200">
            {metrics ? `${metrics.failureRate.toFixed(1)}%` : '--'}
          </span>
        </div>
        <div className="flex flex-col items-center justify-center text-center border-l border-r border-slate-700/50">
          <span className="text-xs text-slate-400 mb-1 uppercase tracking-wider">Failed</span>
          <span className="font-mono text-lg font-semibold text-rose-400">
            {metrics ? metrics.failedCalls : '--'}
          </span>
        </div>
        <div className="flex flex-col items-center justify-center text-center">
          <span className="text-xs text-slate-400 mb-1 uppercase tracking-wider">Blocked</span>
          <span className="font-mono text-lg font-semibold text-amber-400">
            {metrics ? metrics.notPermittedCalls : '--'}
          </span>
        </div>
      </div>
    </div>
  );
};
