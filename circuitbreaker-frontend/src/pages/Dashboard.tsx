import { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { ServiceStatusCard } from '../components/ServiceStatusCard';
import { CircuitBreakerCard } from '../components/CircuitBreakerCard';
import { MetricsCard } from '../components/MetricsCard';
import { ChaosControls } from '../components/ChaosControls';
import { getAllResilienceMetrics, getEurekaApps } from '../services/api';
import type { ResilienceMetrics } from '../types/resilience';

export const Dashboard = () => {
  const [metrics, setMetrics] = useState<ResilienceMetrics | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [backendOffline, setBackendOffline] = useState(false);
  const [servicesStatus, setServicesStatus] = useState({
    eureka: 'UNKNOWN' as 'UP' | 'DOWN' | 'UNKNOWN',
    apiGateway: 'UNKNOWN' as 'UP' | 'DOWN' | 'UNKNOWN',
    product: 'UNKNOWN' as 'UP' | 'DOWN' | 'UNKNOWN',
    inventory: 'UNKNOWN' as 'UP' | 'DOWN' | 'UNKNOWN',
    recommendation: 'UNKNOWN' as 'UP' | 'DOWN' | 'UNKNOWN',
  });

  const fetchData = async () => {
    try {
      const eurekaData = await getEurekaApps();
      const apps = eurekaData.applications.application || [];
      
      const isUp = (appName: string) => {
        const app = apps.find((a: any) => a.name === appName);
        return app?.instance?.[0]?.status === 'UP' ? 'UP' : 'DOWN';
      };

      setServicesStatus({
        eureka: 'UP', // If we could fetch, Eureka is up
        apiGateway: isUp('API-GATEWAY'),
        product: isUp('PRODUCT-SERVICE'),
        inventory: isUp('INVENTORY-SERVICE'),
        recommendation: isUp('RECOMMENDATION-SERVICE'),
      });

      const metricsData = await getAllResilienceMetrics();
      setMetrics(metricsData);
      setBackendOffline(false);
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
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow max-w-7xl mx-auto w-full p-6">
        {backendOffline && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
            <strong className="font-bold">Backend Unavailable! </strong>
            <span className="block sm:inline">Ensure the Java backend services are running.</span>
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">System Dashboard</h2>
          <span className="text-sm text-gray-500">Last updated: {lastUpdated || 'Loading...'}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
          <ServiceStatusCard name="Eureka Registry" port="8080" status={servicesStatus.eureka} />
          <ServiceStatusCard name="API Gateway" port="8084" status={servicesStatus.apiGateway} />
          <ServiceStatusCard name="Product Service" port="8081" status={servicesStatus.product} />
          <ServiceStatusCard name="Inventory Service" port="8082" status={servicesStatus.inventory} />
          <ServiceStatusCard name="Recommendation" port="8083" status={servicesStatus.recommendation} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <CircuitBreakerCard metrics={metrics} />
          </div>
          <div className="lg:col-span-2">
            <MetricsCard metrics={metrics} />
          </div>
        </div>

        <ChaosControls />
      </main>
    </div>
  );
};
