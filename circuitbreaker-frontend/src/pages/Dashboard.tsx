import { useEffect, useState, useCallback } from 'react';
import { Header } from '../components/Header';
import { ServiceStatusCard } from '../components/ServiceStatusCard';
import { CircuitBreakerCard } from '../components/CircuitBreakerCard';
import { MetricsCard } from '../components/MetricsCard';
import { ChaosControls } from '../components/ChaosControls';
import { TracingCard } from '../components/TracingCard';
import { ServiceIsolationPanel } from '../components/ServiceIsolationPanel';
import {
  getAllResilienceMetrics,
  getEurekaApps,
  getZipkinServices,
  warmupAllServices,
  checkServiceHealth,
} from '../services/api';
import type { ResilienceMetrics } from '../types/resilience';
import type { StatusType } from '../components/StatusBadge';

interface ServiceMeta {
  status: StatusType;
  latencyMs: number | null;
  lastChecked: string;
  error?: string;
}

const DEFAULT_META: ServiceMeta = {
  status: 'UNKNOWN',
  latencyMs: null,
  lastChecked: '',
};

export const Dashboard = () => {
  const [metrics, setMetrics] = useState<ResilienceMetrics | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [backendOffline, setBackendOffline] = useState(false);

  const [eurekaStatus, setEurekaStatus] = useState<ServiceMeta>(DEFAULT_META);
  const [gatewayStatus, setGatewayStatus] = useState<ServiceMeta>(DEFAULT_META);
  const [productStatus, setProductStatus] = useState<ServiceMeta>(DEFAULT_META);
  const [inventoryStatus, setInventoryStatus] = useState<ServiceMeta>(DEFAULT_META);
  const [recommendationStatus, setRecommendationStatus] = useState<ServiceMeta>(DEFAULT_META);
  const [zipkinStatus, setZipkinStatus] = useState<StatusType>('UNKNOWN');
  const [tracedServices, setTracedServices] = useState<string[]>([]);

  const fetchData = useCallback(async () => {
    try {
      // 1. Eureka — primary health signal
      const eurekaResult = await checkServiceHealth('eureka', '/eureka-api/apps');
      setEurekaStatus({
        status: eurekaResult.status,
        latencyMs: eurekaResult.latencyMs,
        lastChecked: eurekaResult.lastChecked,
        error: eurekaResult.error,
      });

      if (eurekaResult.status === 'DOWN') {
        setBackendOffline(true);
        setGatewayStatus(s => ({ ...s, status: 'UNKNOWN' }));
        setProductStatus(s => ({ ...s, status: 'UNKNOWN' }));
        setInventoryStatus(s => ({ ...s, status: 'UNKNOWN' }));
        setRecommendationStatus(s => ({ ...s, status: 'UNKNOWN' }));
        setLastUpdated(new Date().toLocaleTimeString());
        return;
      }

      // 2. Parse registered apps from Eureka
      const eurekaData = await getEurekaApps().catch(() => null);
      const apps = eurekaData?.applications?.application ?? [];

      const isUp = (appName: string): StatusType => {
        const app = apps.find((a: any) => a.name === appName);
        return app?.instance?.[0]?.status === 'UP' ? 'UP' : 'DOWN';
      };

      // 3. Per-service latency checks in parallel
      const [gwH, prodH, invH, recH] = await Promise.all([
        checkServiceHealth('api-gateway', '/gateway/actuator/health'),
        checkServiceHealth('product-service', '/gateway/product-service/products'),
        checkServiceHealth('inventory-service', '/gateway/inventory-service/inventory/1'),
        checkServiceHealth('recommendation-service', '/gateway/recommendation-service/recommendations/1'),
      ]);

      setGatewayStatus({
        status: (isUp('API-GATEWAY') === 'UP' && gwH.status === 'UP') ? 'UP' : (isUp('API-GATEWAY') === 'UP' ? 'UP' : 'DOWN'),
        latencyMs: gwH.latencyMs,
        lastChecked: gwH.lastChecked,
        error: gwH.error,
      });
      setProductStatus({
        status: isUp('PRODUCT-SERVICE'),
        latencyMs: prodH.latencyMs,
        lastChecked: prodH.lastChecked,
        error: prodH.status === 'DOWN' ? prodH.error : undefined,
      });
      setInventoryStatus({
        status: isUp('INVENTORY-SERVICE'),
        latencyMs: invH.latencyMs,
        lastChecked: invH.lastChecked,
        error: invH.status === 'DOWN' ? invH.error : undefined,
      });
      setRecommendationStatus({
        status: isUp('RECOMMENDATION-SERVICE'),
        latencyMs: recH.latencyMs,
        lastChecked: recH.lastChecked,
        error: recH.status === 'DOWN' ? recH.error : undefined,
      });

      // 4. Resilience metrics
      const metricsData = await getAllResilienceMetrics().catch(() => null);
      if (metricsData) setMetrics(metricsData);
      setBackendOffline(false);

      // 5. Zipkin
      try {
        const zipkinData = await getZipkinServices();
        setTracedServices(zipkinData);
        setZipkinStatus(zipkinData && zipkinData.length > 0 ? 'UP' : 'DOWN');
      } catch {
        setZipkinStatus('DOWN');
        setTracedServices([]);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
      setBackendOffline(true);
      setEurekaStatus(s => ({ ...s, status: 'DOWN' }));
      setZipkinStatus('DOWN');
      setMetrics(null);
    } finally {
      setLastUpdated(new Date().toLocaleTimeString());
    }
  }, []);

  useEffect(() => {
    // Send background warm-up pings to all microservices on Render on initial page load
    warmupAllServices();
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      <Header isOffline={backendOffline} lastUpdated={lastUpdated} />

      <main className="flex-grow max-w-7xl mx-auto w-full p-4 md:p-6 lg:p-8 space-y-8">

        {backendOffline && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 px-6 py-4 rounded-xl shadow-lg shadow-rose-900/20 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-2xl">⚠️</span>
              <div>
                <strong className="block font-bold text-rose-300">SYSTEM OFFLINE</strong>
                <span className="text-sm opacity-90">Unable to connect to backend services. Services may be waking up — please wait ~45 seconds.</span>
              </div>
            </div>
          </div>
        )}

        {import.meta.env.PROD && !backendOffline && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-6 py-4 rounded-xl shadow-lg shadow-emerald-900/20 flex items-center gap-4">
            <span className="text-2xl">✨</span>
            <div>
              <strong className="block font-bold text-emerald-300">LIVE OBSERVABILITY ACTIVE</strong>
              <span className="text-sm opacity-90">Eureka service discovery, Zipkin distributed tracing, and Resilience4j Actuator metrics are fully live.</span>
            </div>
          </div>
        )}

        {/* System Overview */}
        <section aria-label="System Overview">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-200 tracking-wide uppercase">System Overview</h2>
            <button
              onClick={fetchData}
              className="text-xs px-3 py-1.5 rounded border border-slate-600 text-slate-400 hover:text-slate-200 hover:border-slate-500 transition-colors"
              aria-label="Refresh service status"
            >
              ↻ Refresh
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <ServiceStatusCard
              name="Eureka Registry"
              port="8080"
              status={eurekaStatus.status}
              latencyMs={eurekaStatus.latencyMs}
              lastChecked={eurekaStatus.lastChecked}
              error={eurekaStatus.error}
            />
            <ServiceStatusCard
              name="API Gateway"
              port="8084"
              status={gatewayStatus.status}
              latencyMs={gatewayStatus.latencyMs}
              lastChecked={gatewayStatus.lastChecked}
              error={gatewayStatus.error}
            />
            <ServiceStatusCard
              name="Product Service"
              port="8081"
              status={productStatus.status}
              latencyMs={productStatus.latencyMs}
              lastChecked={productStatus.lastChecked}
              error={productStatus.error}
            />
            <ServiceStatusCard
              name="Inventory Service"
              port="8082"
              status={inventoryStatus.status}
              latencyMs={inventoryStatus.latencyMs}
              lastChecked={inventoryStatus.lastChecked}
              error={inventoryStatus.error}
            />
            <ServiceStatusCard
              name="Recommendation"
              port="8083"
              status={recommendationStatus.status}
              latencyMs={recommendationStatus.latencyMs}
              lastChecked={recommendationStatus.lastChecked}
              error={recommendationStatus.error}
            />
          </div>
        </section>

        {/* Circuit Breaker + Tracing + Metrics */}
        <section aria-label="Circuit Breaker and Metrics" className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          <div className="lg:col-span-1 flex flex-col gap-6">
            <TracingCard
              status={zipkinStatus}
              services={tracedServices}
            />
            <CircuitBreakerCard metrics={metrics} />
          </div>
          <div className="lg:col-span-3">
            <MetricsCard metrics={metrics} />
          </div>
        </section>

        {/* Chaos Controls */}
        <section aria-label="Recommendation Failure Testing">
          <ChaosControls />
        </section>

        {/* Service Isolation */}
        <section aria-label="Service Isolation Testing">
          <ServiceIsolationPanel />
        </section>

      </main>
    </div>
  );
};
