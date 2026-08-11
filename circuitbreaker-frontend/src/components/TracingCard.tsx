import React from 'react';
import type { StatusType } from './StatusBadge';

interface TracingCardProps {
  status: StatusType;
  services: string[];
}

export const TracingCard: React.FC<TracingCardProps> = ({ status, services }) => {
  const isUp = status === 'UP';
  const isLocalOnly = status === 'LOCAL_ONLY';
  
  const getIndicatorColor = () => {
    switch (status) {
      case 'UP': return 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]';
      case 'DOWN': return 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]';
      case 'LOCAL_ONLY': return 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]';
      default: return 'bg-slate-500';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'UP': return 'UP';
      case 'DOWN': return 'DOWN';
      case 'LOCAL_ONLY': return 'LOCAL ONLY';
      default: return 'UNKNOWN';
    }
  };

  return (
    <div className="bg-slate-800/80 backdrop-blur-md rounded-xl p-5 border border-slate-700/50 shadow-lg shadow-black/20 flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-1">
            Zipkin Tracing
          </h3>
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${getIndicatorColor()}`} />
            <span className="text-xl font-bold text-slate-100">
              {getStatusText()}
            </span>
          </div>
        </div>
        
        <button
          onClick={() => {
            const url = import.meta.env.PROD ? '/zipkin' : 'http://localhost:9411';
            window.open(url, '_blank');
          }}
          disabled={!isUp}
          className={`text-xs ${
            !isUp
              ? 'bg-slate-700 text-slate-400 cursor-not-allowed border-slate-600'
              : 'bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/40 hover:text-indigo-200 border-indigo-500/30'
          } px-3 py-1.5 rounded-md transition-colors border flex items-center gap-1.5 font-medium`}
          title="Open Zipkin UI"
        >
          <span>Open Zipkin</span>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
        </button>
      </div>

      <div className="mt-2 flex-grow">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-slate-400">Traced Services</span>
          <span className="text-sm font-mono text-indigo-300 bg-indigo-500/10 px-2 rounded">
            {isLocalOnly ? '--' : services.length}
          </span>
        </div>
        
        {isLocalOnly ? (
          <div className="text-xs text-amber-400/80 italic mt-3 bg-slate-900/50 p-2.5 rounded text-center border border-slate-800">
            Tracing available in local development only
          </div>
        ) : services.length > 0 ? (
          <div className="flex flex-wrap gap-2 mt-3">
            {services.map(svc => (
              <span key={svc} className="text-xs px-2 py-1 bg-slate-700/50 border border-slate-600/50 text-slate-300 rounded shadow-sm">
                {svc}
              </span>
            ))}
          </div>
        ) : (
          <div className="text-sm text-slate-500 italic mt-3 bg-slate-900/50 p-2 rounded text-center border border-slate-800">
            {isUp ? "No services registered yet" : "Tracing offline"}
          </div>
        )}
      </div>
    </div>
  );
};
