export const Header = ({ isOffline, lastUpdated }: { isOffline: boolean; lastUpdated: string }) => (
  <header className="bg-slate-900/50 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
      <div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent tracking-tight">
          CircuitBreaker
        </h1>
        <p className="text-slate-400 text-sm font-medium tracking-wide">Cloud-Native Resilience Monitoring</p>
      </div>
      <div className="flex flex-col items-end gap-1">
        <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700/50">
          <span className="relative flex h-2.5 w-2.5">
            {!isOffline && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isOffline ? 'bg-rose-500' : 'bg-emerald-500'}`}></span>
          </span>
          <span className={`text-xs font-bold tracking-wider ${isOffline ? 'text-rose-400' : 'text-emerald-400'}`}>
            {isOffline ? 'SYSTEM OFFLINE' : 'SYSTEM HEALTHY'}
          </span>
        </div>
        <span className="text-xs text-slate-500 font-mono">
          Last updated: {lastUpdated || '...'}
        </span>
      </div>
    </div>
  </header>
);
