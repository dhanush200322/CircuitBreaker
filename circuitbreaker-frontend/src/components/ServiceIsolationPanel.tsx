import { useState } from 'react';
import { triggerProductRequest, triggerInventoryRequest, triggerNormalRequest } from '../services/api';

interface IsolationResult {
  status: number | null;
  data: any;
  duration: number;
  error: string | null;
}

const ResultTile = ({
  label,
  endpoint,
  result,
  loading,
  onTrigger,
  color,
}: {
  label: string;
  endpoint: string;
  result: IsolationResult | null;
  loading: boolean;
  onTrigger: () => void;
  color: string;
}) => {
  const isSuccess = result?.status != null && result.status >= 200 && result.status < 300;
  const isFailing = result && !isSuccess;

  return (
    <div className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-4 flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="text-sm font-semibold text-slate-200">{label}</h4>
          <p className="text-xs text-slate-500 font-mono mt-0.5">{endpoint}</p>
        </div>
        <button
          onClick={onTrigger}
          disabled={loading}
          aria-label={`Send request to ${label}`}
          className={`text-xs px-3 py-1.5 rounded border font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${color}`}
        >
          {loading ? '…' : 'Test'}
        </button>
      </div>

      {result && (
        <div className="text-xs font-mono border-t border-slate-700/40 pt-2 space-y-1">
          <div className="flex gap-4">
            <span className={isSuccess ? 'text-emerald-400' : 'text-rose-400'}>
              HTTP {result.status ?? 'ERR'}
            </span>
            <span className="text-slate-500">{result.duration}ms</span>
            <span className={isSuccess ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
              {isSuccess ? '✓ Healthy' : '✗ Failed'}
            </span>
          </div>
          {result.error ? (
            <p className="text-rose-400 truncate" title={result.error}>{result.error}</p>
          ) : (
            <pre className="text-slate-400 overflow-hidden max-h-16 text-xs leading-tight">
              {JSON.stringify(result.data, null, 2).slice(0, 180)}
            </pre>
          )}
          {isFailing && (
            <p className="text-amber-400 italic">
              ⚠ This service is unavailable but others may still be healthy
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export const ServiceIsolationPanel = () => {
  const [productResult, setProductResult] = useState<IsolationResult | null>(null);
  const [inventoryResult, setInventoryResult] = useState<IsolationResult | null>(null);
  const [recResult, setRecResult] = useState<IsolationResult | null>(null);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [loadingRec, setLoadingRec] = useState(false);

  const testProduct = async () => {
    setLoadingProduct(true);
    const r = await triggerProductRequest();
    setProductResult({ status: r.status, data: r.data, duration: r.duration, error: r.error });
    setLoadingProduct(false);
  };

  const testInventory = async () => {
    setLoadingInventory(true);
    const r = await triggerInventoryRequest();
    setInventoryResult({ status: r.status, data: r.data, duration: r.duration, error: r.error });
    setLoadingInventory(false);
  };

  const testRec = async () => {
    setLoadingRec(true);
    try {
      const start = Date.now();
      const r = await triggerNormalRequest();
      setRecResult({ status: r.status, data: r.data, duration: Date.now() - start, error: null });
    } catch (e: any) {
      setRecResult({ status: null, data: null, duration: 0, error: e.message });
    }
    setLoadingRec(false);
  };

  return (
    <div className="bg-slate-800/80 backdrop-blur-md rounded-xl p-6 border border-slate-700/50 shadow-lg shadow-black/20">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-slate-100">Service Isolation</h2>
        <p className="text-sm text-slate-400 mt-1">
          Test each microservice independently — Product and Inventory remain healthy even when Recommendation is failing.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ResultTile
          label="Product Service"
          endpoint="/gateway/product-service/products"
          result={productResult}
          loading={loadingProduct}
          onTrigger={testProduct}
          color="bg-indigo-500/20 border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/30"
        />
        <ResultTile
          label="Inventory Service"
          endpoint="/gateway/inventory-service/inventory/1"
          result={inventoryResult}
          loading={loadingInventory}
          onTrigger={testInventory}
          color="bg-cyan-500/20 border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30"
        />
        <ResultTile
          label="Recommendation Service"
          endpoint="/gateway/recommendation-service/recommendations/1"
          result={recResult}
          loading={loadingRec}
          onTrigger={testRec}
          color="bg-rose-500/20 border-rose-500/40 text-rose-300 hover:bg-rose-500/30"
        />
      </div>
    </div>
  );
};
