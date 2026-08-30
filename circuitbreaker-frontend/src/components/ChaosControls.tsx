import { useState } from 'react';
import {
  triggerNormalRequest,
  triggerFailureRequest,
  triggerLatencyRequest,
  getRecentZipkinTrace,
} from '../services/api';
import type { TraceSummary } from '../services/api';

interface RequestResult {
  status: number;
  duration: number;
  data: any;
}

/** Detect if the backend returned a fallback response */
const isFallbackResponse = (data: any): boolean => {
  if (!data) return false;
  // Explicit fallback flag
  if (data.fallback === true) return true;
  // Heuristic: single recommendation string containing 'Fallback'
  const recs: string[] = data.recommendations ?? [];
  return recs.some((r) => typeof r === 'string' && r.toLowerCase().includes('fallback'));
};

const FallbackBanner = ({ data }: { data: any }) => {
  const recs: string[] = data.recommendations ?? [];
  return (
    <div className="mb-3 px-4 py-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">⚠️</span>
        <strong className="text-amber-300 font-bold text-sm">
          Recommendations temporarily unavailable — showing Top Sellers
        </strong>
      </div>
      {data.source && (
        <p className="text-xs text-amber-400/80 mb-1">Source: <span className="font-mono">{data.source}</span></p>
      )}
      {data.message && (
        <p className="text-xs text-amber-400/80 mb-2 italic">{data.message}</p>
      )}
      {recs.length > 0 && (
        <ul className="list-disc list-inside text-xs text-amber-300 space-y-0.5">
          {recs.map((r, i) => <li key={i}>{r}</li>)}
        </ul>
      )}
    </div>
  );
};

const TraceRow = ({ trace, zipkinUp }: { trace: TraceSummary; zipkinUp: boolean }) => {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(trace.traceId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const zipkinUrl = import.meta.env.PROD
    ? 'https://circuitbreaker-zipkin.onrender.com/zipkin/'
    : 'http://localhost:9411';

  return (
    <div className="mt-4 pt-4 border-t border-slate-700/50">
      <h3 className="text-xs font-semibold text-indigo-400 mb-2 uppercase tracking-wide">Trace Summary</h3>
      <div className="bg-slate-800/80 rounded p-3 text-xs text-slate-300 font-mono space-y-1.5 border border-slate-700">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-500">Trace ID:</span>
          <span className="text-indigo-300 break-all">{trace.traceId}</span>
          <button
            onClick={copy}
            title="Copy trace ID"
            className="ml-1 px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs"
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
          {zipkinUp && (
            <a
              href={zipkinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 px-2 py-0.5 rounded bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-300 text-xs"
            >
              Open in Zipkin ↗
            </a>
          )}
        </div>
        <div><span className="text-slate-500">Duration:</span> {trace.durationMs}ms</div>
        <div><span className="text-slate-500">Services:</span> <span className="text-emerald-400">{trace.services.join(' → ')}</span></div>
      </div>
    </div>
  );
};

export const ChaosControls = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const [result, setResult] = useState<{ type: string; res: RequestResult } | null>(null);
  const [trace, setTrace] = useState<TraceSummary | null>(null);
  const [fetchingTrace, setFetchingTrace] = useState(false);
  const [zipkinUp, setZipkinUp] = useState(false);

  const handleRequest = async (
    type: string,
    fetchFn: () => Promise<RequestResult>,
    displayType: string
  ) => {
    setLoading(type);
    setResult(null);
    setTrace(null);
    try {
      const requestStartTime = Date.now();
      const res = await fetchFn();
      setResult({ type: displayType, res });

      setFetchingTrace(true);
      setTimeout(async () => {
        try {
          // Check zipkin availability
          const zRes = await fetch('/zipkin/api/v2/services').catch(() => null);
          const isUp = zRes?.ok ?? false;
          setZipkinUp(isUp);
          const fetchedTrace = await getRecentZipkinTrace(requestStartTime);
          setTrace(fetchedTrace);
        } catch {
          setTrace(null);
        } finally {
          setFetchingTrace(false);
        }
      }, 1000);
    } catch (e: any) {
      setResult({ type: displayType, res: { status: 500, duration: 0, data: { error: e.message } } });
    } finally {
      setLoading(null);
    }
  };

  const clear = () => { setResult(null); setTrace(null); };

  const fallback = result?.res?.data ? isFallbackResponse(result.res.data) : false;
  const isError = result?.res?.status !== 200;

  return (
    <div className="bg-slate-800/80 backdrop-blur-md rounded-xl p-6 border border-slate-700/50 shadow-lg shadow-black/20 mt-6">
      <div className="mb-6 flex justify-between items-start flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Chaos Controls</h2>
          <p className="text-sm text-slate-400 mt-1">Trigger requests to the Recommendation Service via API Gateway</p>
        </div>
        {result && (
          <button
            onClick={clear}
            className="text-xs px-3 py-1.5 rounded border border-slate-600 text-slate-400 hover:text-slate-200 hover:border-slate-500 transition-colors"
            aria-label="Clear last result"
          >
            Clear
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <button
          id="btn-normal-request"
          onClick={() => handleRequest('normal', triggerNormalRequest, 'Normal Request')}
          disabled={loading !== null}
          aria-label="Send normal recommendation request"
          className="flex-1 bg-indigo-600/80 hover:bg-indigo-500 text-white font-semibold py-3 px-4 rounded-lg shadow-lg shadow-indigo-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all border border-indigo-500/50"
        >
          {loading === 'normal' ? 'Sending…' : 'Normal Request'}
        </button>
        <button
          id="btn-trigger-failure"
          onClick={() => handleRequest('failure', triggerFailureRequest, 'Trigger Failure')}
          disabled={loading !== null}
          aria-label="Inject failure into recommendation request"
          className="flex-1 bg-rose-600/80 hover:bg-rose-500 text-white font-semibold py-3 px-4 rounded-lg shadow-lg shadow-rose-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all border border-rose-500/50"
        >
          {loading === 'failure' ? 'Sending…' : 'Trigger Failure'}
        </button>
        <button
          id="btn-trigger-latency"
          onClick={() => handleRequest('latency', triggerLatencyRequest, 'Trigger Latency')}
          disabled={loading !== null}
          aria-label="Inject 3 second delay into recommendation request"
          className="flex-1 bg-amber-600/80 hover:bg-amber-500 text-white font-semibold py-3 px-4 rounded-lg shadow-lg shadow-amber-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all border border-amber-500/50"
        >
          {loading === 'latency' ? 'Sending…' : 'Trigger Latency'}
        </button>
      </div>

      <div className="bg-slate-900 rounded-lg p-5 border border-slate-700/50 relative overflow-hidden min-h-[140px]">
        {!result && !loading && (
          <div className="absolute inset-0 flex items-center justify-center text-slate-500 font-mono text-sm">
            Waiting for request…
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center text-slate-400 font-mono text-sm animate-pulse">
            Executing {loading} request…
          </div>
        )}

        {result && !loading && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 pb-3 border-b border-slate-700/50 gap-2">
              <span className="font-semibold text-slate-300">
                Last Request: <span className="text-slate-100">{result.type}</span>
              </span>
              <div className="flex gap-4 text-sm font-mono">
                <span className={isError && !fallback ? 'text-rose-400' : 'text-emerald-400'}>
                  Status: {result.res.status}
                </span>
                <span className="text-slate-400">{result.res.duration}ms</span>
              </div>
            </div>

            {/* Fallback detection */}
            {fallback ? (
              <FallbackBanner data={result.res.data} />
            ) : (
              <pre className="text-sm text-slate-300 bg-black/30 p-3 rounded overflow-auto max-h-40 font-mono scrollbar-thin">
                {JSON.stringify(result.res.data, null, 2)}
              </pre>
            )}

            {/* Trace */}
            {fetchingTrace ? (
              <div className="mt-4 pt-4 border-t border-slate-700/50">
                <div className="text-sm text-slate-400 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-indigo-500 animate-ping" />
                  Waiting for Zipkin ingestion…
                </div>
              </div>
            ) : trace ? (
              <TraceRow trace={trace} zipkinUp={zipkinUp} />
            ) : (
              <div className="mt-4 pt-4 border-t border-slate-700/50">
                <span className="text-xs text-slate-500 italic">Trace unavailable</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
