import { useState } from 'react';
import { triggerNormalRequest, triggerFailureRequest, triggerLatencyRequest } from '../services/api';

interface RequestResult {
  status: number;
  duration: number;
  data: any;
}

export const ChaosControls = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const [result, setResult] = useState<RequestResult | null>(null);

  const handleRequest = async (type: string, fetchFn: () => Promise<RequestResult>) => {
    setLoading(type);
    setResult(null);
    try {
      const res = await fetchFn();
      setResult(res);
    } catch (e: any) {
      setResult({ status: 500, duration: 0, data: { error: e.message } });
    } finally {
      setLoading(null);
    }
  };

  const isFallback = result?.data?.recommendations?.[0]?.includes('Fallback');

  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-100 mt-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Chaos Controls</h2>
      <p className="text-sm text-gray-500 mb-6">Trigger requests to the Recommendation Service via API Gateway.</p>
      
      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={() => handleRequest('normal', triggerNormalRequest)}
          disabled={loading !== null}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded shadow disabled:opacity-50"
        >
          {loading === 'normal' ? 'Sending...' : 'Normal Request'}
        </button>
        <button
          onClick={() => handleRequest('failure', triggerFailureRequest)}
          disabled={loading !== null}
          className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded shadow disabled:opacity-50"
        >
          {loading === 'failure' ? 'Sending...' : 'Trigger Failure'}
        </button>
        <button
          onClick={() => handleRequest('latency', triggerLatencyRequest)}
          disabled={loading !== null}
          className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded shadow disabled:opacity-50"
        >
          {loading === 'latency' ? 'Sending...' : 'Trigger Latency'}
        </button>
      </div>

      {result && (
        <div className={`p-4 rounded-md border ${isFallback ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex justify-between mb-2">
            <span className="font-semibold text-gray-700">Response Status: <span className={result.status === 200 ? 'text-green-600' : 'text-red-600'}>{result.status}</span></span>
            <span className="text-sm text-gray-500">{result.duration}ms</span>
          </div>
          <pre className="text-sm text-gray-800 bg-gray-100 p-2 rounded overflow-auto max-h-40">
            {JSON.stringify(result.data, null, 2)}
          </pre>
          {isFallback && (
            <p className="mt-2 text-sm font-semibold text-orange-600">⚠️ Fallback Response Returned!</p>
          )}
        </div>
      )}
    </div>
  );
};
