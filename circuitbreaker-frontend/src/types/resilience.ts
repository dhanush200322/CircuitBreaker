export interface ActuatorHealth {
  status: 'UP' | 'DOWN' | 'UNKNOWN' | 'OUT_OF_SERVICE';
}

export interface EurekaApps {
  applications: {
    application: Array<{
      name: string;
      instance: Array<{
        status: string;
      }>;
    }>;
  };
}

export interface MetricResponse {
  name: string;
  measurements: Array<{
    statistic: string;
    value: number;
  }>;
}

export interface ResilienceMetrics {
  circuitBreakerState: number; // 0 = CLOSED, 1 = OPEN, 2 = HALF_OPEN
  circuitBreakerStateValue: number;
  failedCalls: number;
  notPermittedCalls: number;
  failureRate: number;
  retryCalls: number;
  timeoutCalls: number;
  rateLimiterAvailable: number;
  bulkheadAvailable: number;
}

export interface ServiceHealth {
  name: string;
  status: 'UP' | 'DOWN' | 'UNKNOWN';
  latencyMs: number | null;
  lastChecked: string;
  error?: string;
}

export interface ServiceRequestResult {
  label: string;
  url: string;
  status: number | null;
  latencyMs: number | null;
  data: any;
  error: string | null;
  loading: boolean;
  traceId: string | null;
}

