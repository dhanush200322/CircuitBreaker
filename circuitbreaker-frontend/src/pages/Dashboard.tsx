import { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { ServiceStatusCard } from '../components/ServiceStatusCard';
import { CircuitBreakerCard } from '../components/CircuitBreakerCard';
import { MetricsCard } from '../components/MetricsCard';
import { ChaosControls } from '../components/ChaosControls';
import { TracingCard } from '../components/TracingCard';
import { getAllResilienceMetrics, getEurekaApps, getZipkinServices } from '../services/api';
import type { ResilienceMetrics } from '../types/resilience';
import type { StatusType } from '../components/StatusBadge';

export const Dashboard = () => {
  const [metrics, setMetrics] = useState<ResilienceMetrics | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [backendOffline, setBackendOffline] = useState(false);
  const [servicesStatus, setServicesStatus] = useState({
    eureka: 'UNKNOWN' as StatusType,
    apiGateway: 'UNKNOWN' as StatusType,
    product: 'UNKNOWN' as StatusType,
    inventory: 'UNKNOWN' as StatusType,
    recommendation: 'UNKNOWN' as StatusType,
  });
  const [zipkinStatus, setZipkinStatus] = useState<StatusType>('UNKNOWN');
  const [tracedServices, setTracedServices] = useState<string[]>([]);

  const fetchData = async () => {
    try {
      if (import.meta.env.PROD) {
        try {
          const res = await fetch('/gateway/product-service/products');
          if (res.ok) {
            setBackendOffline(false);
            setServicesStatus({
              eureka: 'LOCAL_ONLY',
              apiGateway: 'UP',
              product: 'UP',
              inventory: 'UP',
              recommendation: 'UP',
            });
            try {
              const metricsData = await getAllResilienceMetrics();
              setMetrics(metricsData);
            } catch (err) {
              console.error('Failed to fetch resilience metrics', err);
              setMetrics(null);
            }
          } else {
            setBackendOffline(true);
            setServicesStatus({
              eureka: 'LOCAL_ONLY',
              apiGateway: 'DOWN',
              product: 'DOWN',
              inventory: 'DOWN',
              recommendation: 'DOWN',
            });
            setMetrics(null);
          }
        } catch {
          setBackendOffline(true);
          setServicesStatus({
            eureka: 'LOCAL_ONLY',
            apiGateway: 'DOWN',
            product: 'DOWN',
            inventory: 'DOWN',
            recommendation: 'DOWN',
          });
          setMetrics(null);
        }
        setZipkinStatus('LOCAL_ONLY');
        setTracedServices([]);
        setLastUpdated(new Date().toLocaleTimeString());
        return;
      }

      const eurekaData = await getEurekaApps();
      const apps = eurekaData.applications.application || [];
      
      const isUp = (appName: string) => {
        const app = apps.find((a: any) => a.name === appName);
        return app?.instance?.[0]?.status === 'UP' ? 'UP' : 'DOWN';
      };

      setServicesStatus({
        eureka: 'UP',
        apiGateway: isUp('API-GATEWAY'),
        product: isUp('PRODUCT-SERVICE'),
        inventory: isUp('INVENTORY-SERVICE'),
        recommendation: isUp('RECOMMENDATION-SERVICE'),
      });

      const metricsData = await getAllResilienceMetrics();
      setMetrics(metricsData);
      setBackendOffline(false);

      try {
        const zipkinData = await getZipkinServices();
        setTracedServices(zipkinData);
        setZipkinStatus(zipkinData.length > 0 || zipkinData !== null ? 'UP' : 'DOWN');
      } catch {
        setZipkinStatus('DOWN');
        setTracedServices([]);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
      setBackendOffline(true);
      setServicesStatus({
        eureka: 'DOWN',
        apiGateway: 'UNKNOWN',
        product: 'UNKNOWN',
        inventory: 'UNKNOWN',
        recommendation: 'UNKNOWN',
      });
    } finally {
      setLastUpdated(new Date().toLocaleTimeString());
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

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
                <span className="text-sm opacity-90">Unable to connect to backend services. Ensure the Java microservices are running.</span>
              </div>
            </div>
          </div>
        )}

        {import.meta.env.PROD && !backendOffline && (
          <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 px-6 py-4 rounded-xl shadow-lg shadow-amber-900/20 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-2xl">ℹ️</span>
              <div>
                <strong className="block font-bold text-amber-300">PUBLIC DEMO MODE</strong>
                <span className="text-sm opacity-90">Observability restricted in public demo. Eureka and Zipkin tracing are disabled for security; live Resilience4j Actuator metrics are active.</span>
              </div>
            </div>
          </div>
        )}

        <section>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-200 tracking-wide uppercase">System Overview</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <ServiceStatusCard name="Eureka Registry" port="8080" status={servicesStatus.eureka} />
            <ServiceStatusCard name="API Gateway" port="8084" status={servicesStatus.apiGateway} />
            <ServiceStatusCard name="Product Service" port="8081" status={servicesStatus.product} />
            <ServiceStatusCard name="Inventory Service" port="8082" status={servicesStatus.inventory} />
            <ServiceStatusCard name="Recommendation" port="8083" status={servicesStatus.recommendation} />
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          <div className="lg:col-span-1 flex flex-col gap-6">
            <TracingCard status={zipkinStatus} services={tracedServices} />
            <CircuitBreakerCard metrics={metrics} />
          </div>
          <div className="lg:col-span-3">
            <MetricsCard metrics={metrics} />
          </div>
        </section>

        <section>
          <ChaosControls />
        </section>
        
      </main>
    </div>
  );
};
