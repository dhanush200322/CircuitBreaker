# CircuitBreaker â€” Comprehensive System Architecture Document

This document provides a deep architectural breakdown of the **CircuitBreaker** cloud-native e-commerce resilience platform, detailing its component interactions, fault-tolerance mechanisms, distributed tracing pipeline, and observability infrastructure.

---

## Table of Contents
1. [High-Level Architecture](#1-high-level-architecture)
2. [Component Responsibilities](#2-component-responsibilities)
3. [Service-to-Service Communication](#3-service-to-service-communication)
4. [Eureka Service Discovery Mechanics](#4-eureka-service-discovery-mechanics)
5. [API Gateway Routing & Edge Architecture](#5-api-gateway-routing--edge-architecture)
6. [Resilience4j Multi-Layered Fault Tolerance](#6-resilience4j-multi-layered-fault-tolerance)
7. [Distributed Tracing Pipeline (Micrometer & Zipkin)](#7-distributed-tracing-pipeline-micrometer--zipkin)
8. [Frontend Architecture & Reverse Proxy](#8-frontend-architecture--reverse-proxy)
9. [Detailed Execution & Failure Flows](#9-detailed-execution--failure-flows)
10. [Observability & Actuator Metrics](#10-observability--actuator-metrics)

---

## 1. High-Level Architecture

The CircuitBreaker platform is built upon a decoupled microservices architecture designed to eliminate single points of failure, isolate cascading latency, and provide real-time visibility into runtime states.

### Architectural Diagram (Mermaid)

```mermaid
graph TD
    Client["React Frontend Dashboard (Port 5173/5175)"]
    Gateway["Spring Cloud API Gateway (Port 8084)"]
    Eureka["Eureka Service Registry (Port 8080)"]
    ProductSvc["Product Service (Port 8081)"]
    InventorySvc["Inventory Service (Port 8082)"]
    RecommendationSvc["Recommendation Service (Port 8083)"]
    Zipkin["Zipkin Server (Port 9411)"]

    Client -->|HTTP / REST (Vite Proxy)| Gateway
    Client -.->|Direct Polling / Actuator| Gateway

    Gateway <-->|Dynamic Discovery Query| Eureka
    ProductSvc -.->|Register / Heartbeat| Eureka
    InventorySvc -.->|Register / Heartbeat| Eureka
    RecommendationSvc -.->|Register / Heartbeat| Eureka

    Gateway -->|Route: /product-service/**| ProductSvc
    Gateway -->|Route: /inventory-service/**| InventorySvc
    Gateway -->|Route: /recommendation-service/**| RecommendationSvc

    subgraph "Recommendation Resilience Pipeline"
        RecommendationSvc --> CB["CircuitBreaker (Aspect Order 1)"]
        CB --> RL["RateLimiter (Aspect Order 2)"]
        RL --> BH["Bulkhead (Aspect Order 3)"]
        BH --> RT["Retry (Aspect Order 4)"]
        RT --> TL["TimeLimiter (Aspect Order 5)"]
        TL --> Logic["Async Business Logic"]
        Logic -.->|Exception / Timeout| Fallback["Fallback Method"]
    end

    Gateway -->|Trace Spans (Brave)| Zipkin
    ProductSvc -->|Trace Spans (Brave)| Zipkin
    InventorySvc -->|Trace Spans (Brave)| Zipkin
    RecommendationSvc -->|Trace Spans (Brave)| Zipkin
```

### Architectural Diagram (ASCII Fallback)

```text
+-------------------------------------------------------------------------------+
|                       React Monitoring & Chaos Dashboard                      |
|                               (Port: 5173 / 5175)                             |
+---------------------------------------+---------------------------------------+
                                        |
                         HTTP REST API  |  (Vite Proxy Forwarding)
                                        v
+-------------------------------------------------------------------------------+
|                             Spring Cloud Gateway                              |
|                                 (Port: 8084)                                  |
+-------------------+-------------------+-------------------+-------------------+
                    |                   |                   |
            Queries |           Queries |           Queries |
                    v                   v                   v
+-------------------------------------------------------------------------------+
|                           Eureka Service Registry                             |
|                                 (Port: 8080)                                  |
+-------------------+-------------------+-------------------+-------------------+
                    ^                   ^                   ^
          Registers |         Registers |         Registers |
                    |                   |                   |
+-------------------+---+   +-----------+-------+   +-------+-------------------+
|    Product Service    |   | Inventory Service |   |   Recommendation Service  |
|     (Port: 8081)      |   |   (Port: 8082)    |   |        (Port: 8083)       |
+-----------+-----------+   +---------+---------+   +-------------+-------------+
            |                         |                           |
            |                         |     +---------------------+---------------------+
            |                         |     | Resilience4j Protection Layers            |
            |                         |     | 1. CircuitBreaker (slidingWindow: 5, 50%) |
            |                         |     | 2. RateLimiter (2 req / 10s window)       |
            |                         |     | 3. Bulkhead (maxConcurrent: 1, wait: 0)   |
            |                         |     | 4. Retry (maxAttempts: 3, wait: 1s)       |
            |                         |     | 5. TimeLimiter (timeout: 2s)              |
            |                         |     | 6. Fallback Method (Graceful Degradation) |
            |                         |     +---------------------+---------------------+
            |                         |                           |
            +-------------------------+---------------------------+
                                      |
                         Async Distributed Spans (HTTP POST)
                                      v
+-------------------------------------------------------------------------------+
|                             Zipkin Tracing Server                             |
|                                 (Port: 9411)                                  |
+-------------------------------------------------------------------------------+
```

---

## 2. Component Responsibilities

### 2.1 Eureka Service Registry (`service-registry`)
- **Port**: `8080`
- **Artifact**: `spring-cloud-starter-netflix-eureka-server`
- **Responsibilities**:
  - Serves as the central directory for service registration and discovery.
  - Maintains heartbeats (renewal leases) and evicts degraded instances.
  - Runs in standalone mode (`register-with-eureka: false`, `fetch-registry: false`).

### 2.2 API Gateway (`api-gateway`)
- **Port**: `8084`
- **Artifact**: `spring-cloud-starter-gateway`, `spring-cloud-starter-loadbalancer`
- **Responsibilities**:
  - Acts as the single perimeter ingress entrypoint for all clients.
  - Dynamic discovery locator (`discovery.locator.enabled=true`, `lower-case-service-id=true`).
  - Routes URLs formatted as `/{service-name}/**` dynamically to backend instances registered with Eureka.
  - Injects and propagates B3/W3C distributed trace headers to downstream services.

### 2.3 Product Service (`product-service`)
- **Port**: `8081`
- **Responsibilities**:
  - Manages product catalog inventory.
  - Exposes `GET /products` returning mock e-commerce items.
  - Registers with Eureka as `PRODUCT-SERVICE`.

### 2.4 Inventory Service (`inventory-service`)
- **Port**: `8082`
- **Responsibilities**:
  - Manages real-time stock levels.
  - Exposes `GET /inventory/{productId}` returning stock availability and quantities.
  - Registers with Eureka as `INVENTORY-SERVICE`.

### 2.5 Recommendation Service (`recommendation-service`)
- **Port**: `8083`
- **Responsibilities**:
  - Generates cross-sell and up-sell recommendations (`GET /recommendations/{productId}`).
  - Serves as the primary resilience testbed using Resilience4j AOP annotations.
  - Implements chaos simulation triggers (`fail=true`, `delay=3000`).
  - Exposes Actuator metrics (`/actuator/metrics`, `/actuator/health`).
  - Registers with Eureka as `RECOMMENDATION-SERVICE`.

### 2.6 Zipkin Server (`openzipkin/zipkin`)
- **Port**: `9411`
- **Responsibilities**:
  - Collects distributed span data via HTTP POST (`/api/v2/spans`).
  - Indexes trace hierarchies and calculates latency breakdowns.
  - Provides REST APIs (`/api/v2/services`, `/api/v2/traces`) for dashboard querying.

### 2.7 React Monitoring Dashboard (`circuitbreaker-frontend`)
- **Port**: `5173` (Dev proxy) / `5175`
- **Responsibilities**:
  - Polls backend state every 3 seconds.
  - Renders live Eureka health status, Resilience4j metrics, and Circuit Breaker states.
  - Provides interactive Chaos Control buttons to trigger failure and latency.
  - Inspects and displays real-time Zipkin trace summaries for each request.

---

## 3. Service-to-Service Communication

All communications between the external client/browser and backend microservices route strictly through the API Gateway. Microservices do not directly expose public ports to end users in production topology.

```text
Browser Client
      â”‚
      â”‚ HTTP Request (e.g. /gateway/recommendation-service/recommendations/1)
      â–¼
Vite Dev Proxy (Port 5173)
      â”‚
      â”‚ Rewrites & forwards to http://localhost:8084
      â–¼
Spring Cloud Gateway (Port 8084)
      â”‚
      â”‚ Resolves instance via Eureka (RECOMMENDATION-SERVICE -> http://localhost:8083)
      â–¼
Recommendation Service (Port 8083)
```

---

## 4. Eureka Service Discovery Mechanics

1. **Client Startup**: When `product-service`, `inventory-service`, `recommendation-service`, or `api-gateway` starts, the `EurekaClient` bean registers its metadata (hostname, IP, port, health URL) with Eureka at `http://localhost:8080/eureka/`.
2. **Heartbeat Renewals**: Every 30 seconds, clients transmit heartbeats to Eureka to renew their leases.
3. **Gateway Discovery Locator**: Spring Cloud Gateway continuously caches the Eureka registry. When a request hits `/recommendation-service/recommendations/1`, the Gateway's discovery locator intercepts the first path segment (`recommendation-service`), translates it to upper case (`RECOMMENDATION-SERVICE`), queries the local registry cache, and forwards the request to `http://localhost:8083/recommendations/1`.

---

## 5. API Gateway Routing & Edge Architecture

The Gateway leverages non-blocking reactive I/O (Project Reactor & Netty).

```properties
spring.application.name=api-gateway
server.port=8084
eureka.client.service-url.defaultZone=http://localhost:8080/eureka/
spring.cloud.gateway.discovery.locator.enabled=true
spring.cloud.gateway.discovery.locator.lower-case-service-id=true

# Distributed Tracing Configuration
management.tracing.sampling.probability=1.0
management.zipkin.tracing.endpoint=http://localhost:9411/api/v2/spans
```

- When `discovery.locator.enabled` is `true`, Spring Cloud Gateway creates dynamic route definitions for every service found in Eureka.
- `lower-case-service-id: true` allows frontend requests to use clean lowercase URLs: `/product-service/**`, `/inventory-service/**`, `/recommendation-service/**`.

---

## 6. Resilience4j Multi-Layered Fault Tolerance

Resilience4j operates via Spring AOP proxies wrapping the target controller method.

### 6.1 Aspect Precedence & Pipeline Execution
Because multiple annotations are placed on the same method, the order of aspect execution determines how failures propagate:

```text
Incoming Request -> [Aspect Order 1: CircuitBreaker]
                     -> [Aspect Order 2: RateLimiter]
                        -> [Aspect Order 3: Bulkhead]
                           -> [Aspect Order 4: Retry]
                              -> [Aspect Order 5: TimeLimiter]
                                 -> Controller Asynchronous Method Execution
```

- **CircuitBreaker (Order 1)** is outermost. If the TimeLimiter times out or the Retry attempts are exhausted, the exception bubbles up to the CircuitBreaker aspect, which increments failure counters, updates the sliding window, and triggers the `fallbackMethod`.
- **RateLimiter (Order 2)** rejects requests immediately with `RequestNotPermitted` if the 2-call quota per 10 seconds is exceeded.
- **Bulkhead (Order 3)** rejects concurrent calls with `BulkheadFullException` if more than 1 concurrent execution is currently running.
- **Retry (Order 4)** catches exceptions thrown by the inner layers and re-executes up to 3 times before giving up.
- **TimeLimiter (Order 5)** cancels the underlying `CompletableFuture` if execution exceeds 2.0 seconds (`TimeoutException`).

### 6.2 Fallback Method Contract
The fallback method in `RecommendationController.java` must match the controller method signature with an extra `Throwable` parameter:

```java
public CompletableFuture<RecommendationResponse> fallbackRecommendations(
        String productId, boolean fail, int delay, Throwable t) {
    logger.error("Fallback triggered for product {}: {}", productId, t.getMessage());
    return CompletableFuture.completedFuture(
        new RecommendationResponse(productId, List.of("No recommendations available at this time (Fallback)"))
    );
}
```

---

## 7. Distributed Tracing Pipeline (Micrometer & Zipkin)

Distributed tracing tracks a transaction across process boundaries.

```text
[API Gateway] Span 1 (Root)
Trace ID: 4bf92f3577b34da6a3ce929d0e0e4736 | Span ID: 4bf92f3577b34da6
  â”‚
  â”œâ”€â”€ [API Gateway Client] Span 2
  â”‚   Trace ID: 4bf92f3577b34da6a3ce929d0e0e4736 | Parent ID: 4bf92f3577b34da6
  â”‚     â”‚
  â”‚     â””â”€â”€ [Recommendation Service] Span 3
  â”‚         Trace ID: 4bf92f3577b34da6a3ce929d0e0e4736 | Parent ID: (Span 2 ID)
```

1. **Context Propagation**: The API Gateway generates a 64-bit/128-bit `traceId` and adds HTTP headers (`traceparent`, `X-B3-TraceId`, `X-B3-SpanId`).
2. **Context Extraction**: The Recommendation Service extracts the trace headers, creates child spans, and binds the context to the execution thread/reactor context.
3. **Span Reporting**: `zipkin-reporter-brave` asynchronously flushes completed spans over HTTP POST to `http://localhost:9411/api/v2/spans`.

---

## 8. Frontend Architecture & Reverse Proxy

The React frontend utilizes Vite's development proxy (`vite.config.ts`) to eliminate CORS issues during local development:

```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/gateway': {
        target: 'http://localhost:8084',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/gateway/, '')
      },
      '/actuator': {
        target: 'http://localhost:8083/actuator',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/actuator/, '')
      },
      '/eureka-api': {
        target: 'http://localhost:8080/eureka',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/eureka-api/, ''),
        headers: { 'Accept': 'application/json' }
      },
      '/zipkin': {
        target: 'http://localhost:9411',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/zipkin/, '')
      }
    }
  }
})
```

---

## 9. Detailed Execution & Failure Flows

### 9.1 Normal Flow
1. User clicks **Normal Request** or calls `GET /recommendation-service/recommendations/1`.
2. Gateway routes to Recommendation Service.
3. Aspect checks pass; controller returns `["Accessories", "Extended Warranty"]`.
4. HTTP 200 OK returned in ~15ms; Zipkin records 3-span trace.

### 9.2 Failure Chaos Flow (`?fail=true`)
1. Request sent with `?fail=true`.
2. Controller throws `RuntimeException("Simulated Recommendation Service failure!")`.
3. Retry attempts 3 times (1s interval).
4. CircuitBreaker intercepts final failure -> calls `fallbackRecommendations(...)`.
5. HTTP 200 OK returned with payload `["No recommendations available at this time (Fallback)"]`.
6. UI displays "Fallback activated" badge.

### 9.3 Latency Chaos Flow (`?delay=3000`)
1. Request sent with `?delay=3000`.
2. Asynchronous thread enters `Thread.sleep(3000)`.
3. TimeLimiter timeout (2s) fires -> raises `TimeoutException`.
4. Retry triggers and attempts next retry cycle.
5. Total elapsed time reaches ~8.05s.
6. Fallback is executed and returned with HTTP 200 OK.
7. Zipkin records complete 8.093s trace spanning gateway and recommendation service.

---

## 10. Observability & Actuator Metrics

The Recommendation Service exposes Resilience4j metrics via Spring Boot Actuator:

| Metric Name | Tag | Description |
|:---|:---|:---|
| `resilience4j.circuitbreaker.state` | `state:closed/open/half_open` | Numeric state of the circuit breaker (0=closed, 1=open, 2=half-open). |
| `resilience4j.circuitbreaker.calls` | `kind:successful/failed/ignored` | Cumulative count of circuit breaker executions. |
| `resilience4j.circuitbreaker.failure.rate` | `name:recommendationService` | Calculated percentage of failed calls across the sliding window. |
| `resilience4j.retry.calls` | `kind:successful_with_retry/...` | Count of retried invocations. |
| `resilience4j.timelimiter.calls` | `kind:timeout/successful` | Count of TimeLimiter timeout events. |
| `resilience4j.ratelimiter.available.permissions` | `name:recommendationService` | Remaining token count in the current 10-second refresh window. |
| `resilience4j.bulkhead.available.concurrent.calls` | `name:recommendationService` | Available concurrency slots (1 or 0). |
| `resilience4j.bulkhead.max.allowed.concurrent.calls` | `name:recommendationService` | Configured max concurrency capacity (1.0). |
