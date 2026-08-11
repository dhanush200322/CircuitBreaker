import type { EurekaApps, MetricResponse, ResilienceMetrics } from '../types/resilience';

const fetchJson = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const getEurekaApps = (): Promise<EurekaApps> => {
  return fetchJson<EurekaApps>('/eureka-api/apps', {
    headers: { 'Accept': 'application/json' }
  });
};

export const getMetric = async (metricName: string, extraTags: string = ''): Promise<number> => {
  try {
    const data = await fetchJson<MetricResponse>(`/actuator/metrics/${metricName}?tag=name:recommendationService${extraTags}`);
    return data.measurements?.[0]?.value ?? 0;
  } catch (e) {
    console.error(`Error fetching metric ${metricName}:`, e);
    return 0;
  }
};

export const getAllResilienceMetrics = async (): Promise<ResilienceMetrics> => {
  const [
    _isClosed,
    isOpen,
    isHalfOpen,
    failedCalls,
    notPermittedCalls,
    failureRate,
    retryCalls,
    timeoutCalls,
    rateLimiterAvailable,
    bulkheadAvailable
  ] = await Promise.all([
    getMetric('resilience4j.circuitbreaker.state', '&tag=state:closed'),
    getMetric('resilience4j.circuitbreaker.state', '&tag=state:open'),
    getMetric('resilience4j.circuitbreaker.state', '&tag=state:half_open'),
    getMetric('resilience4j.circuitbreaker.calls', '&tag=kind:failed'),
    getMetric('resilience4j.circuitbreaker.not.permitted.calls'),
    getMetric('resilience4j.circuitbreaker.failure.rate'),
    getMetric('resilience4j.retry.calls', '&tag=kind:failed_with_retry'),
    getMetric('resilience4j.timelimiter.calls', '&tag=kind:timeout'),
    getMetric('resilience4j.ratelimiter.available.permissions'),
    getMetric('resilience4j.bulkhead.available.concurrent.calls')
  ]);

  let circuitBreakerStateValue = 0; // default CLOSED
  if (isOpen === 1) circuitBreakerStateValue = 1;
  else if (isHalfOpen === 1) circuitBreakerStateValue = 2;

  return {
    circuitBreakerState: circuitBreakerStateValue,
    circuitBreakerStateValue,
    failedCalls,
    notPermittedCalls,
    failureRate: failureRate >= 0 ? failureRate : 0, // actuator might return -1 if not enough calls
    retryCalls,
    timeoutCalls,
    rateLimiterAvailable,
    bulkheadAvailable
  };
};

export const triggerNormalRequest = async () => {
  const start = Date.now();
  const res = await fetch('/gateway/recommendation-service/recommendations/1');
  const data = await res.json();
  const duration = Date.now() - start;
  return { status: res.status, data, duration };
};

export const triggerFailureRequest = async () => {
  const start = Date.now();
  const res = await fetch('/gateway/recommendation-service/recommendations/1?fail=true');
  const data = await res.json();
  const duration = Date.now() - start;
  return { status: res.status, data, duration };
};

export const triggerLatencyRequest = async () => {
  const start = Date.now();
  const res = await fetch('/gateway/recommendation-service/recommendations/1?delay=3000');
  const data = await res.json();
  const duration = Date.now() - start;
  return { status: res.status, data, duration };
};
