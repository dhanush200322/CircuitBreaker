import { useState } from 'react';
import { triggerNormalRequest, triggerFailureRequest, triggerLatencyRequest } from '../services/api';

interface RequestResult {
  status: number;
  duration: number;
  data: any;
}

export const ChaosControls = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const [result, setResult] = useState<{ type: string; res: RequestResult } | null>(null);

  const handleRequest = async (type: string, fetchFn: () => Promise<RequestResult>, displayType: string) => {
    setLoading(type);
    setResult(null);
    try {
      const res = await fetchFn();
      setResult({ type: displayType, res });
    } catch (e: any) {
      setResult({ type: displayType, res: { status: 500, duration: 0, data: { error: e.message } } });
    } finally {
      setLoading(null);
    }
  };

  const isFallback = result?.res?.data?.recommendations?.[0]?.includes('Fallback');
  const isError = result?.res?.status !== 200;

  return (
    <div className="bg-slate-800/80 backdrop-blur-md rounded-xl p-6 border border-slate-700/50 shadow-lg shadow-black/20 mt-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-100">Chaos Controls</h2>
        <p className="text-sm text-slate-400 mt-1">Trigger requests to the Recommendation Service via API Gateway</p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <button
          onClick={() => handleRequest('normal', triggerNormalRequest, 'Normal Request')}
          disabled={loading !== null}
          className="flex-1 bg-indigo-600/80 hover:bg-indigo-500 text-white font-semibold py-3 px-4 rounded-lg shadow-lg shadow-indigo-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all border border-indigo-500/50"
        >
          {loading === 'normal' ? 'Sending...' : 'Normal Request'}
        </button>
        <button
          onClick={() => handleRequest('failure', triggerFailureRequest, 'Trigger Failure')}
          disabled={loading !== null}
          className="flex-1 bg-rose-600/80 hover:bg-rose-500 text-white font-semibold py-3 px-4 rounded-lg shadow-lg shadow-rose-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all border border-rose-500/50"
        >
          {loading === 'failure' ? 'Sending...' : 'Trigger Failure'}
        </button>
        <button
          onClick={() => handleRequest('latency', triggerLatencyRequest, 'Trigger Latency')}
          disabled={loading !== null}
          className="flex-1 bg-amber-600/80 hover:bg-amber-500 text-white font-semibold py-3 px-4 rounded-lg shadow-lg shadow-amber-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all border border-amber-500/50"
        >
          {loading === 'latency' ? 'Sending...' : 'Trigger Latency'}
        </button>
      </div>

      <div className="bg-slate-900 rounded-lg p-5 border border-slate-700/50 relative overflow-hidden min-h-[140px]">
        {!result && !loading && (
          <div className="absolute inset-0 flex items-center justify-center text-slate-500 font-mono text-sm">
            Waiting for request...
          </div>
        )}
        
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center text-slate-400 font-mono text-sm animate-pulse">
            Executing {loading} request...
          </div>
        )}

        {result && !loading && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 pb-3 border-b border-slate-700/50 gap-2">
              <span className="font-semibold text-slate-300">
                Last Request: <span className="text-slate-100">{result.type}</span>
              </span>
              <div className="flex gap-4 text-sm font-mono">
                <span className={isError ? 'text-rose-400' : 'text-emerald-400'}>
                  Status: {result.res.status}
                </span>
                <span className="text-slate-400">
                  {result.res.duration}ms
                </span>
              </div>
            </div>
            
            {isFallback && (
              <div className="mb-3 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm rounded flex items-center font-semibold">
                ⚠️ Fallback activated
              </div>
            )}

            <pre className="text-sm text-slate-300 bg-black/30 p-3 rounded overflow-auto max-h-40 font-mono scrollbar-thin">
              {JSON.stringify(result.res.data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
