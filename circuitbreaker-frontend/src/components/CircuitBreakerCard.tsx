import type { ResilienceMetrics } from '../types/resilience';

interface CircuitBreakerCardProps {
  metrics: ResilienceMetrics | null;
}

const STATE_FLOW = [
  {
    value: 0,
    label: 'CLOSED',
    desc: 'Requests flow normally',
    active: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.3)]',
    inactive: 'bg-slate-800 text-slate-500 border-slate-700/40',
    dot: 'bg-emerald-500',
  },
  {
    value: 1,
    label: 'OPEN',
    desc: 'Requests fail fast → fallback',
    active: 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.35)] animate-pulse',
    inactive: 'bg-slate-800 text-slate-500 border-slate-700/40',
    dot: 'bg-rose-500',
  },
  {
    value: 2,
    label: 'HALF_OPEN',
    desc: 'Limited test requests probe recovery',
    active: 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.3)]',
    inactive: 'bg-slate-800 text-slate-500 border-slate-700/40',
    dot: 'bg-amber-500',
  },
];

export const CircuitBreakerCard = ({ metrics }: CircuitBreakerCardProps) => {
  const isLocal = metrics === null;
  const stateValue = metrics?.circuitBreakerStateValue ?? -1;

  const currentState = STATE_FLOW.find(s => s.value === stateValue);

  return (
    <div className="bg-slate-800/80 backdrop-blur-md rounded-xl p-6 border border-slate-700/50 flex flex-col h-full shadow-lg shadow-black/20">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-slate-100">Circuit Breaker</h2>
        <p className="text-sm text-slate-400 font-mono mt-1">Recommendation Service</p>
      </div>

      {/* Current state badge */}
      <div className="flex flex-col items-center justify-center mb-5">
        {isLocal ? (
          <div className="px-6 py-3 rounded-full border-2 bg-amber-500/10 text-amber-400 border-amber-500/30 text-xl font-bold tracking-widest flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            UNKNOWN
          </div>
        ) : (
          <div className={`px-6 py-3 rounded-full border-2 flex items-center gap-2 transition-all duration-300 ${currentState?.active ?? 'bg-slate-700 text-slate-400 border-slate-600'}`}>
            <span className={`w-3 h-3 rounded-full ${currentState?.dot ?? 'bg-slate-500'}`} />
            <span className="text-xl font-bold tracking-widest">{currentState?.label ?? 'UNKNOWN'}</span>
          </div>
        )}
        {currentState && !isLocal && (
          <p className="text-xs text-slate-500 mt-2 italic">{currentState.desc}</p>
        )}
      </div>

      {/* State transition flow */}
      <div className="mb-5">
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">State Lifecycle</p>
        <div className="flex items-center gap-1 flex-wrap">
          {STATE_FLOW.map((s, i) => (
            <span key={s.value} className="flex items-center gap-1">
              <span
                title={s.desc}
                className={`text-xs font-bold px-2 py-0.5 rounded border transition-all ${
                  !isLocal && stateValue === s.value ? s.active : s.inactive
                }`}
              >
                {s.label}
              </span>
              {i < STATE_FLOW.length - 1 && (
                <span className="text-slate-600 text-xs">→</span>
              )}
            </span>
          ))}
          <span className="text-slate-600 text-xs">→ CLOSED</span>
        </div>
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-3 gap-3 bg-slate-900/50 rounded-lg p-3 border border-slate-700/50 mt-auto">
        <div className="flex flex-col items-center text-center">
          <span className="text-xs text-slate-400 mb-1 uppercase tracking-wider">Failure Rate</span>
          <span className="font-mono text-base font-semibold text-slate-200">
            {metrics ? `${metrics.failureRate.toFixed(1)}%` : '--'}
          </span>
        </div>
        <div className="flex flex-col items-center text-center border-l border-r border-slate-700/50">
          <span className="text-xs text-slate-400 mb-1 uppercase tracking-wider">Failed</span>
          <span className="font-mono text-base font-semibold text-rose-400">
            {metrics ? metrics.failedCalls : '--'}
          </span>
        </div>
        <div className="flex flex-col items-center text-center">
          <span className="text-xs text-slate-400 mb-1 uppercase tracking-wider">Blocked</span>
          <span className="font-mono text-base font-semibold text-amber-400">
            {metrics ? metrics.notPermittedCalls : '--'}
          </span>
        </div>
      </div>
    </div>
  );
};
