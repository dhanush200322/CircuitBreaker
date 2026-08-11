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
  circuitBreakerState: number; // 0 = CLOSED, 1 = OPEN, 2 = HALF_OPEN (from ordinal if exposed like that, or we map it)
  // Actually resilience4j exposes state as 0 (closed), 1 (open), 2 (half_open) depending on version, wait.
  // The JSON from actuator earlier was {"statistic":"VALUE","value":1.0} for OPEN or CLOSED? Wait, CLOSED=0, OPEN=1?
  // I will check it in the api.ts
  circuitBreakerStateValue: number;
  failedCalls: number;
  notPermittedCalls: number;
  failureRate: number;
  retryCalls: number;
  timeoutCalls: number;
  rateLimiterAvailable: number;
  bulkheadAvailable: number;
}
