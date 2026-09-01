# AXLERO SOLUTIONS / INTELLEQ ACADEMY
## 4-WEEK FINAL TECHNICAL PROJECT REVIEW REPORT

---

**PROJECT NAME:** CircuitBreaker — Cloud-Native E-Commerce API Gateway  
**DOMAINS:** Microservices Architecture, Cloud-Native Resilience & API Gateway  
**GITHUB REPOSITORY:** [https://github.com/dhanush200322/CircuitBreaker](https://github.com/dhanush200322/CircuitBreaker)  
**LIVE DEPLOYMENT:** [https://circuit-breaker-one.vercel.app/](https://circuit-breaker-one.vercel.app/)  
**REVIEW MILESTONE:** 4-Week Final Project Review & Completion  
**SUBMISSION DATE:** September 2026  

---

## 1. COVER PAGE & OFFICIAL TEAM ROSTER

| Attribute | Details |
|:---|:---|
| **Project Title** | CircuitBreaker — Cloud-Native E-Commerce API Gateway |
| **Organization Context** | Axlero Solutions / IntelleQ Academy Internship Program |
| **Review Scope** | 4-Week Final Project Review (Weeks 1 to 4) |
| **Primary Repository** | [https://github.com/dhanush200322/CircuitBreaker](https://github.com/dhanush200322/CircuitBreaker) |
| **Live Frontend URL** | [https://circuit-breaker-one.vercel.app/](https://circuit-breaker-one.vercel.app/) |
| **Core Technology Stack** | Java 17, Spring Boot 3.2.5, Spring Cloud 2023.0.1, Eureka, Resilience4j, Zipkin, React 19 |
| **Document Status** | Final Submission-Ready Review Report |

### Official Team Roster

- **Team Leader**: Dhanush AV
- **Team Member 1**: Upputuri Venkata Geethasri
- **Team Member 2**: Satish Kumar Verma
- **Team Member 3**: Prem Burnwal

*Attribution Note: Primary technical implementation, backend microservices architecture, gateway routing, Resilience4j configuration, React frontend, QA testing suite, and live production deployment were engineered by Dhanush AV. Individual contribution details for team members to be confirmed by the team.*

---

## 2. INTERNSHIP & 4-WEEK REVIEW SCOPE

This report presents the formal technical documentation for the **CircuitBreaker** platform developed during the Axlero Solutions / IntelleQ Academy internship program. The project demonstrates cloud-native microservice routing, dynamic service discovery, defense-in-depth fault tolerance, failure isolation, distributed tracing, and real-time observability in high-throughput distributed e-commerce systems.

### 4-Week Final Project Review Scope Breakdown

The final 4-week implementation directly maps to the official Axlero project specification:

```text
+-----------------------------------------------------------------------------------+
|                        4-WEEK FINAL PROJECT REVIEW SCOPE                          |
+-----------------------------------------------------------------------------------+
| WEEK 1: CORE MICROSERVICES & INGRESS ROUTING                                     |
| - Product Service (:8081)                                                         |
| - Inventory Service (:8082)                                                       |
| - Recommendation Service (:8083)                                                  |
| - Eureka Service Registry (:8080)                                                 |
| - Spring Cloud API Gateway (:8084) & Dynamic Route Resolution                     |
+-----------------------------------------------------------------------------------+
| WEEK 2: RESILIENCE4J FAULT TOLERANCE & CHAOS SIMULATION                           |
| - Resilience4j Circuit Breaker Aspect Integration                                 |
| - Recommendation Service Fallback Execution                                       |
| - Failure Chaos Simulation (?fail=true)                                           |
| - React Monitoring Dashboard & Chaos Control UI                                   |
| - Circuit Breaker State Transition Logic (CLOSED -> OPEN -> HALF-OPEN)            |
+-----------------------------------------------------------------------------------+
| WEEK 3: ADVANCED RESILIENCE & CONCURRENCY ISOLATION                               |
| - Resilience4j RateLimiter (2 requests / 10-second quota)                        |
| - Resilience4j Bulkhead (maxConcurrentCalls: 1 concurrency isolation)             |
| - Actuator Metrics Exposure & Real-Time Circuit State Visualization              |
+-----------------------------------------------------------------------------------+
| WEEK 4: DISTRIBUTED TRACING & OBSERVABILITY PIPELINE                              |
| - Micrometer Tracing & OpenZipkin Server (:9411) Integration                      |
| - W3C / B3 Distributed Context Header Propagation                                 |
| - Latency Chaos Simulation (?delay=3000) & TimeLimiter Timeout Execution          |
| - React UI Trace Summary & Waterfall Integration                                  |
+-----------------------------------------------------------------------------------+
```

---

## 3. EXECUTIVE SUMMARY

Modern microservices architectures rely on decoupled services communicating across network boundaries. However, unhandled network latency, server crashes, or downstream exceptions can cause cascading failures, worker thread pool exhaustion, and widespread system outages.

**CircuitBreaker** resolves these vulnerabilities by establishing a self-healing cloud-native ingress and fault-isolation platform:
- **Centralized Service Discovery**: Netflix Eureka eliminates hardcoded host IPs by dynamically registering microservices and tracking instance heartbeats.
- **Reactive Ingress Routing**: Spring Cloud Gateway acts as a non-blocking entry point with automatic discovery locator mapping.
- **Defense-in-Depth Resilience Pipeline**: Employs Resilience4j Circuit Breakers, Smart Retries, TimeLimiters (timeouts), Bulkheads, and Rate Limiters on critical endpoints.
- **Graceful Fallback Degradation**: Guarantees that clients receive sanitized fallback responses (`HTTP 200 OK`) instead of raw 500 error cascades during downstream failures.
- **End-to-End Distributed Tracing**: Micrometer Tracing and OpenZipkin propagate trace context headers across network boundaries, exposing request timing bottlenecks.
- **React Observability & Chaos Dashboard**: Renders live service health, actuator metrics, circuit breaker states, and provides interactive controls to inject failure and latency conditions.

---

## 4. TABLE OF CONTENTS

1. Cover Page & Official Team Roster
2. Internship & 4-Week Review Scope
3. Executive Summary
4. Table of Contents
5. Project Overview
6. Problem Statement
7. Project Objectives
8. Official Requirements & Specifications (Weeks 1 to 4)
9. Verified Technology Stack
10. Complete System Architecture
11. Microservices Architecture Breakdown
12. Week 1 Implementation: Service Discovery & API Gateway Routing
13. Week 2 Implementation: Circuit Breaker & Fallback Mechanics
14. Week 3 Implementation: Rate Limiting & Bulkhead Concurrency Isolation
15. Week 4 Implementation: Distributed Tracing & Latency Timeout Handling
16. Resilience4j Aspect Ordering & Configuration Deep-Dive
17. Functional Execution & Chaos Failure Scenarios
18. React Monitoring & Chaos Control UI
19. Quality Assurance & QA Testing Matrix (Verified 22 Tests)
20. Live Production Deployment & Environment Scope
21. Verified Performance & Reliability Results
22. Technical Challenges & Applied Solutions
23. Team Contributions & Responsibilities
24. Categorized Enhancements (Completed vs Future Work)
25. Conclusion
26. References & Key Project Artifacts
27. Appendix: Axlero 4-Week Final Review Checklist

---

## 5. PROJECT OVERVIEW

The **CircuitBreaker** platform is an enterprise-grade cloud-native e-commerce API gateway and microservices architecture. It demonstrates how distributed systems maintain continuous uptime and zero client-facing 500 errors even when downstream microservices experience total failures, thread pool exhaustion, or severe network latency.

### Core System Services
1. **Service Registry (`service-registry`)**: Netflix Eureka Server running on port `8080`.
2. **API Gateway (`api-gateway`)**: Spring Cloud Gateway running on port `8084`.
3. **Product Catalog Service (`product-service`)**: Microservice running on port `8081`.
4. **Inventory Service (`inventory-service`)**: Microservice running on port `8082`.
5. **Recommendation Service (`recommendation-service`)**: Resilience testbed microservice running on port `8083`.
6. **Zipkin Tracing Server (`openzipkin/zipkin`)**: Distributed tracing collector running on port `9411`.
7. **Frontend Dashboard (`circuitbreaker-frontend`)**: React 19 / TypeScript UI running locally on port `5173`/`5175` and deployed live on Vercel.

---

## 6. PROBLEM STATEMENT

When monolithic applications are migrated to microservices:
1. **Cascading Outages**: When a downstream dependency degrades or experiences latency, upstream callers block waiting for responses, exhausting worker thread pools and crashing healthy services.
2. **Brittle Network Configuration**: Hardcoding IP addresses or static load balancers prevents auto-scaling and creates single points of failure.
3. **Degraded Customer Trust**: Raw HTTP 500 error cascades break frontend shopping experiences and deteriorate client trust.
4. **Observability Blind Spots**: Tracking request latency across multi-hop distributed networks without unified trace context is nearly impossible.

---

## 7. PROJECT OBJECTIVES

1. **Dynamic Registration**: Implement Netflix Eureka for dynamic service discovery.
2. **Reactive Edge Ingress**: Deploy Spring Cloud Gateway for single-entry non-blocking routing.
3. **Multi-Layer Fault Tolerance**: Wrap critical endpoints with Resilience4j Circuit Breaker, Retry, TimeLimiter, RateLimiter, and Bulkhead aspects.
4. **Graceful Fallbacks**: Ensure failing backend calls return HTTP 200 fallback responses.
5. **Distributed Tracing**: Integrate Micrometer Tracing and OpenZipkin for multi-span trace visualization.
6. **Live Observability**: Build a React monitoring dashboard with real-time metrics and chaos triggers (`?fail=true`, `?delay=3000`).
7. **Production Deployment**: Deploy the frontend dashboard publicly on Vercel ([https://circuit-breaker-one.vercel.app/](https://circuit-breaker-one.vercel.app/)).

---

## 8. OFFICIAL REQUIREMENTS & SPECIFICATIONS

### Week 1 Specifications
- Create Product, Inventory, and Recommendation microservices.
- Set up Netflix Eureka Service Registry.
- Set up Spring Cloud Gateway with dynamic discovery locator routing (`/{service-name}/**`).

### Week 2 Specifications
- Integrate Resilience4j dependencies and AOP aspects.
- Configure Circuit Breaker sliding window and failure threshold.
- Implement Recommendation Service fallback handler.
- Build monitoring UI with chaos simulation controls.

### Week 3 Specifications
- Implement Resilience4j Rate Limiter (`limitForPeriod=2`, `limitRefreshPeriod=10s`).
- Implement Resilience4j Bulkhead (`maxConcurrentCalls=1`).
- Expose Actuator metrics and visualize circuit breaker state transitions in the UI.

### Week 4 Specifications
- Integrate Micrometer Tracing and Zipkin span exporter (`http://localhost:9411/api/v2/spans`).
- Implement latency simulation (`?delay=3000`) and TimeLimiter timeout handling (`timeoutDuration=2s`).
- Refine frontend trace visualization.

---

## 9. VERIFIED TECHNOLOGY STACK

All technologies and versions were verified directly from project configuration files (`pom.xml`, `package.json`, `docker-compose.prod.yml`, `application.properties`):

| Domain | Technology | Version | Verification Source |
|:---|:---|:---|:---|
| **Language** | Java (LTS) | `17.0.17` | `pom.xml` / System Environment |
| **Framework** | Spring Boot | `3.2.5` | Root `pom.xml` (`<parent>`) |
| **Cloud Stack** | Spring Cloud | `2023.0.1` | Root `pom.xml` (`<spring-cloud.version>`) |
| **Service Discovery** | Netflix Eureka Server / Client | `3.2.5` | `service-registry/pom.xml` |
| **API Gateway** | Spring Cloud Gateway (Netty) | `3.2.5` | `api-gateway/pom.xml` |
| **Fault Tolerance** | Resilience4j Spring Boot 3 | `2.2.0` | `recommendation-service/pom.xml` |
| **Distributed Tracing**| Micrometer Tracing Brave & Zipkin | `3.2.5` / `3.4.1` | `recommendation-service/pom.xml` |
| **Frontend UI** | React / TypeScript / Vite | `19.2.8` / `6.0.2` / `8.2.0` | `circuitbreaker-frontend/package.json` |
| **Styling** | Tailwind CSS | `4.3.3` | `circuitbreaker-frontend/package.json` |
| **Containerization** | Docker / Docker Compose | `29.5.3` / `5.1.4` | `docker-compose.prod.yml` |
| **Live Deployment** | Vercel Edge Network | Live Public URL | [https://circuit-breaker-one.vercel.app/](https://circuit-breaker-one.vercel.app/) |

---

## 10. COMPLETE SYSTEM ARCHITECTURE

```text
+-----------------------------------------------------------------------------------+
|                        React Monitoring & Chaos Dashboard                         |
|             Local: http://localhost:5173 | Production: Vercel Edge                    |
+-----------------------------------------+-----------------------------------------+
                                          |
                         HTTP / REST API  | (Vite Proxy / Edge Rewrites)
                                          v
+-----------------------------------------------------------------------------------+
|                              Spring Cloud API Gateway                             |
|                                    (Port: 8084)                                   |
+---------------------+-------------------+-------------------+---------------------+
                      |                   |                   |
              Queries |           Queries |           Queries |
                      v                   v                   v
+-----------------------------------------------------------------------------------+
|                            Netflix Eureka Service Registry                        |
|                                    (Port: 8080)                                   |
+---------------------+-------------------+-------------------+---------------------+
                      ^                   ^                   ^
            Registers |         Registers |         Registers |
                      |                   |                   |
+---------------------+---+   +-----------+-------+   +-------+---------------------+
|   Product Service       |   | Inventory Service |   |  Recommendation Service     |
|    (Port: 8081)         |   |    (Port: 8082)   |   |     (Port: 8083)            |
+-------------------------+   +-------------------+   +-----------+-----------------+
                                                                  |
                                              Resilience4j Aspect | Protection Pipeline
                                                                  v
                                                      +-----------------------------+
                                                      | 1. CircuitBreaker (Order 1) |
                                                      | 2. RateLimiter (Order 2)    |
                                                      | 3. Bulkhead (Order 3)       |
                                                      | 4. Retry (Order 4)          |
                                                      | 5. TimeLimiter (Order 5)    |
                                                      +--------------+--------------+
                                                                     |
                                                Exception / Timeout  v
                                                      +-----------------------------+
                                                      | Graceful Fallback Method    |
                                                      | returns HTTP 200 Fallback   |
                                                      +--------------+--------------+
                                                                     |
                                             Async Trace Spans Export|
                                                                     v
                                                      +-----------------------------+
                                                      | OpenZipkin Tracing Server   |
                                                      | (Port: 9411)                |
                                                      +-----------------------------+
```

---

## 11. MICROSERVICES ARCHITECTURE BREAKDOWN

### 1. Service Registry (`service-registry`) — Port `8080`
- **Class**: `ServiceRegistryApplication` (`@EnableEurekaServer`)
- Maintains dynamic IP/port registry of all running instances.

### 2. API Gateway (`api-gateway`) — Port `8084`
- **Class**: `ApiGatewayApplication`
- Acts as perimeter reverse proxy, resolving paths dynamically via Eureka (`spring.cloud.gateway.discovery.locator.enabled=true`).

### 3. Product Service (`product-service`) — Port `8081`
- Exposes `GET /products` returning mock e-commerce items. Registered as `PRODUCT-SERVICE`.

### 4. Inventory Service (`inventory-service`) — Port `8082`
- Exposes `GET /inventory/{productId}` returning stock availability. Registered as `INVENTORY-SERVICE`.

### 5. Recommendation Service (`recommendation-service`) — Port `8083`
- Exposes `GET /recommendations/{productId}`. Primary resilience testbed wrapped with Resilience4j aspects and Actuator endpoints. Registered as `RECOMMENDATION-SERVICE`.

### 6. Zipkin Server (`openzipkin/zipkin`) — Port `9411`
- Collects distributed span data via HTTP POST (`/api/v2/spans`) and exposes trace search APIs.

---

## 12. WEEK 1 IMPLEMENTATION: SERVICE DISCOVERY & GATEWAY ROUTING

Week 1 delivered core microservices, service discovery registration, and reactive API Gateway ingress routing.

```text
React Frontend
      │
      ▼
Spring Cloud Gateway (:8084)
      │
      ├── Query Discovery Cache ──► Eureka Service Registry (:8080)
      │
      ├── Route: /product-service/** ─────────► Product Service (:8081)
      ├── Route: /inventory-service/** ────────► Inventory Service (:8082)
      └── Route: /recommendation-service/** ──► Recommendation Service (:8083)
```

- **Dynamic Route Locator**: Gateway maps `/product-service/products` to `PRODUCT-SERVICE` in Eureka and forwards to `http://localhost:8081/products`.

---

## 13. WEEK 2 IMPLEMENTATION: CIRCUIT BREAKER & FALLBACK MECHANICS

Week 2 integrated Resilience4j, configured the Recommendation Service Circuit Breaker, established fallback methods, and built the chaos simulation frontend.

### `RecommendationController.java` Controller Implementation

```java
@GetMapping("/{productId}")
@CircuitBreaker(name = "recommendationService", fallbackMethod = "fallbackRecommendations")
@RateLimiter(name = "recommendationService")
@Bulkhead(name = "recommendationService")
@Retry(name = "recommendationService")
@TimeLimiter(name = "recommendationService")
public CompletableFuture<RecommendationResponse> getRecommendations(
        @PathVariable String productId,
        @RequestParam(required = false, defaultValue = "false") boolean fail,
        @RequestParam(required = false, defaultValue = "0") int delay) {
    
    return CompletableFuture.supplyAsync(() -> {
        if (delay > 0) {
            try {
                Thread.sleep(delay);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
        if (fail) {
            throw new RuntimeException("Simulated Recommendation Service failure!");
        }
        return new RecommendationResponse(productId, List.of("Accessories", "Extended Warranty"));
    });
}

public CompletableFuture<RecommendationResponse> fallbackRecommendations(
        String productId, boolean fail, int delay, Throwable t) {
    logger.error("Fallback triggered for product {}: {}", productId, t.getMessage());
    return CompletableFuture.completedFuture(
        new RecommendationResponse(productId, List.of("No recommendations available at this time (Fallback)"))
    );
}
```

### Circuit Breaker State Transition Lifecycle

```text
    ┌────────────────────────────────────────────────────────┐
    │                                                        │
    ▼                                                        │
┌────────┐   Failure Rate > 50%    ┌──────┐   Wait 5s    ┌───────────┐
│ CLOSED │ ──────────────────────► │ OPEN │ ───────────► │ HALF-OPEN │
└────────┘ (5-call sliding window) └──────┘ (Auto Transit)└───────────┘
    ▲                                                        │
    │               All 3 Calls Successful                   │
    └────────────────────────────────────────────────────────┘
```

1. **`CLOSED`**: Requests execute normally. Failure rate evaluated across a 5-call sliding window.
2. **`OPEN`**: When failure rate exceeds 50%, all calls immediately short-circuit to `fallbackRecommendations(...)` for 5 seconds.
3. **`HALF-OPEN`**: After 5 seconds, permits 3 trial calls. If all succeed, state resets to `CLOSED`; if any fail, state reverts to `OPEN`.

---

## 14. WEEK 3 IMPLEMENTATION: RATE LIMITING & BULKHEAD CONCURRENCY ISOLATION

Week 3 implemented advanced protection aspects and exposed Actuator metrics for real-time visualization.

### 1. Resilience4j Rate Limiter
- Configured: `limitForPeriod=2`, `limitRefreshPeriod=10s`, `timeoutDuration=0`.
- Behavior: Restricts traffic to 2 calls per 10 seconds per client window. Excess calls throw `RequestNotPermitted` and trigger fallback.

### 2. Resilience4j Bulkhead
- Configured: `maxConcurrentCalls=1`, `maxWaitDuration=0`.
- Behavior: Restricts concurrent executions to 1 active call. Overlapping calls throw `BulkheadFullException` and trigger immediate fallback, protecting thread pools.

---

## 15. WEEK 4 IMPLEMENTATION: DISTRIBUTED TRACING & LATENCY TIMEOUT HANDLING

Week 4 integrated distributed tracing with Micrometer and OpenZipkin, along with latency simulation and TimeLimiter timeouts.

### 1. Distributed Context Propagation
- The Gateway generates a W3C/B3 `traceId` and injects HTTP headers. Downstream services extract context and record child span execution timelines.
- Spans are exported asynchronously via HTTP POST to Zipkin at `http://localhost:9411/api/v2/spans`.

### 2. Latency & TimeLimiter Timeout
- Configured: `timeoutDuration=2s`, `cancelRunningFuture=true`.
- Behavior: Requests with `?delay=3000` exceed the 2.0s limit, raising `TimeoutException`. Retry attempts follow, and the Circuit Breaker returns the fallback response after elapsed time without exposing client timeouts.

---

## 16. RESILIENCE4J ASPECT ORDERING & CONFIGURATION DEEP-DIVE

As verified in `recommendation-service/src/main/resources/application.properties`:

```properties
resilience4j.circuitbreaker.circuitBreakerAspectOrder=1
resilience4j.ratelimiter.rateLimiterAspectOrder=2
resilience4j.retry.retryAspectOrder=4
resilience4j.timelimiter.timeLimiterAspectOrder=5

# Circuit Breaker Configuration
resilience4j.circuitbreaker.instances.recommendationService.slidingWindowSize=5
resilience4j.circuitbreaker.instances.recommendationService.failureRateThreshold=50
resilience4j.circuitbreaker.instances.recommendationService.waitDurationInOpenState=5s
resilience4j.circuitbreaker.instances.recommendationService.permittedNumberOfCallsInHalfOpenState=3

# Retry Configuration
resilience4j.retry.instances.recommendationService.maxAttempts=3
resilience4j.retry.instances.recommendationService.waitDuration=1s

# TimeLimiter Configuration
resilience4j.timelimiter.instances.recommendationService.timeoutDuration=2s

# RateLimiter Configuration
resilience4j.ratelimiter.instances.recommendationService.limitForPeriod=2
resilience4j.ratelimiter.instances.recommendationService.limitRefreshPeriod=10s

# Bulkhead Configuration
resilience4j.bulkhead.instances.recommendationService.maxConcurrentCalls=1
resilience4j.bulkhead.instances.recommendationService.maxWaitDuration=0
```

---

## 17. FUNCTIONAL EXECUTION & CHAOS FAILURE SCENARIOS

### Scenario A: Normal Request (Happy Path)
`Frontend -> Gateway (:8084) -> Recommendation Service (:8083) -> Response`
- **Result**: `HTTP 200 OK`, `["Accessories", "Extended Warranty"]`, duration ~15ms.

### Scenario B: Chaos Failure Injection (`?fail=true`)
`Frontend -> Gateway -> Recommendation Service (throws RuntimeException) -> Retry (3x) -> CircuitBreaker -> Fallback`
- **Result**: `HTTP 200 OK`, `["No recommendations available at this time (Fallback)"]`.

### Scenario C: Latency Chaos Injection (`?delay=3000`)
`Frontend -> Gateway -> Recommendation Service (Thread.sleep 3s) -> TimeLimiter Timeout (2s) -> Fallback`
- **Result**: `HTTP 200 OK`, fallback payload returned after timeout/retry boundary.

---

## 18. REACT MONITORING & CHAOS CONTROL UI

The React 19 frontend provides real-time health checks, metric polling, and chaos simulation:
- **`ServiceStatusCard.tsx`**: Queries Eureka registry status for all services.
- **`CircuitBreakerCard.tsx`**: Displays state (`CLOSED`, `OPEN`, `HALF-OPEN`) and Actuator metrics.
- **`ChaosControls.tsx`**: Triggers `Normal Request`, `Trigger Failure` (`?fail=true`), and `Trigger Latency` (`?delay=3000`).
- **`TracingCard.tsx`**: Summarizes Zipkin trace IDs and span timelines.

---

## 19. QUALITY ASSURANCE & QA TESTING MATRIX

Documented and verified from `docs/QA_REPORT.md` (22 Test Cases, 100% Pass Rate):

| Test ID | Milestone | Target Component | Test Objective | Expected Result | Actual Result | Status |
|:---:|:---:|:---|:---|:---|:---|:---:|
| **QA-001** | Week 1 | Git Repository | Verify clean working tree | Clean working tree | Synchronized at commit `e36f020` | **PASS** |
| **QA-002** | Week 1 | Eureka Registry | Verify 4 services registered | 4 apps registered UP | 4 apps reported UP | **PASS** |
| **QA-003** | Week 1 | Product Service | Verify direct catalog endpoint | `HTTP 200 OK` product list | Returned 2 product items | **PASS** |
| **QA-004** | Week 1 | Inventory Service | Verify direct stock endpoint | `HTTP 200 OK` stock details | Returned `inStock: true` | **PASS** |
| **QA-005** | Week 1 | Recommendation Service | Verify direct recommendation endpoint | `HTTP 200 OK` recommendations | Returned 2 recommendation items | **PASS** |
| **QA-006** | Week 1 | Gateway Ingress | Verify Gateway routing -> Product | Path routed via Eureka | `HTTP 200 OK` catalog JSON | **PASS** |
| **QA-007** | Week 1 | Gateway Ingress | Verify Gateway routing -> Inventory | Path routed via Eureka | `HTTP 200 OK` inventory JSON | **PASS** |
| **QA-008** | Week 1 | Gateway Ingress | Verify Gateway routing -> Recommendation | Path routed via Eureka | `HTTP 200 OK` recommendation JSON | **PASS** |
| **QA-009** | Week 1 | End-to-End Flow | Validate normal happy path latency | Response < 50ms | Response returned in ~15ms | **PASS** |
| **QA-010** | Week 2 | Chaos Failure | Validate `?fail=true` handling | Fallback executed; HTTP 200 | Returned `HTTP 200 OK` Fallback JSON | **PASS** |
| **QA-011** | Week 2 | Fallback Aspect | Validate non-500 response behavior | No HTTP 500 returned | Fallback returned cleanly | **PASS** |
| **QA-012** | Week 4 | Chaos Latency | Validate 2s timeout on `?delay=3000` | TimeLimiter timeout & fallback | Elapsed ~8.05s; `HTTP 200 OK` Fallback | **PASS** |
| **QA-013** | Week 3 | Bulkhead Aspect | Validate max 1 concurrent execution | Concurrency slots drop to 0 | Max concurrency 1.0 enforced | **PASS** |
| **QA-014** | Week 3 | Rate Limiter Aspect | Validate 2 req / 10s period quota | Metric tracks permissions | Confirmed `value: 2.0` permissions | **PASS** |
| **QA-015** | Week 2 | Circuit Breaker Metric | Validate Actuator metric tracking | Track call counts & failures | Total calls tracked (`COUNT=37`) | **PASS** |
| **QA-016** | Week 2 | Retry Metric | Validate retry count exposure | Track retry attempts | Retries tracked (`failed_with_retry: 9`) | **PASS** |
| **QA-017** | Week 4 | Zipkin Ingestion | Validate service span collection | List 4 registered services | Returned `["api-gateway", ...]` | **PASS** |
| **QA-018** | Week 4 | Trace Propagation | Validate 3-span context propagation | Trace hierarchy connected | Parent/child spans verified | **PASS** |
| **QA-019** | Week 4 | Trace Latency Detail | Validate trace timing under latency | Trace records full timing | Duration recorded as 8.093s | **PASS** |
| **QA-020** | Week 4 | Vite Zipkin Proxy | Validate dev proxy forwarding | Proxy forwards `/zipkin/*` | Identical service list returned | **PASS** |
| **QA-021** | Week 1 | Actuator Health | Validate microservice health status | Health detail returned `UP` | Returned `{"status":"UP"}` | **PASS** |
| **QA-022** | Week 1 | Codebase Integrity | Validate repository cleanliness | Working tree clean | Clean working tree | **PASS** |

---

## 20. LIVE PRODUCTION DEPLOYMENT & ENVIRONMENT SCOPE

The system is deployed in a production edge topology:
- **Live Public URL**: [https://circuit-breaker-one.vercel.app/](https://circuit-breaker-one.vercel.app/)
- **Frontend Hosting**: Vercel Global Edge Network.
- **Backend Stack**: Production Docker Compose stack (`docker-compose.prod.yml`) connected via secure Cloudflare Ingress Tunnels.
- **CORS Ingress**: Rewrites configured in `vercel.json` to route `/gateway/*` and `/eureka-api/*` without exposing raw internal ports to the public internet.

---

## 21. VERIFIED PERFORMANCE & RELIABILITY RESULTS

1. **Zero Unhandled Errors**: Chaos failure injections (`?fail=true`) and latency delays (`?delay=3000`) delivered fallback responses (`HTTP 200 OK`), preventing client-side 500 error cascades.
2. **Low Baseline Latency**: Gateway path routing adds ~15ms baseline overhead.
3. **Automated Recovery**: Circuit Breaker state transitions from `OPEN` to `HALF-OPEN` after 5 seconds, restoring normal execution upon verifying 3 successful trial calls.

---

## 22. TECHNICAL CHALLENGES & APPLIED SOLUTIONS

| Technical Challenge | Root Cause | Implemented Solution |
|:---|:---|:---|
| **Gateway Routing Cold Start** | Gateway attempted to route calls before services completed Eureka registration. | Added container `depends_on` health checks in `docker-compose.prod.yml`. |
| **Aspect Order Precedence** | Default Resilience4j aspect order caused CircuitBreaker to miss TimeLimiter timeouts. | Defined explicit aspect orders (`CircuitBreaker=1`, `RateLimiter=2`, `Retry=4`, `TimeLimiter=5`) in `application.properties`. |
| **Fallback Signature Mismatch** | Resilience4j threw `NoSuchMethodException` when fallback parameter signatures differed. | Updated fallback method parameters to match controller method signatures, ending with `Throwable t`. |
| **Vercel Browser CORS** | Cross-Origin requests from Vercel frontend to backend tunnels were blocked by browsers. | Implemented server-side edge rewrites in `vercel.json` to proxy API traffic under a single origin. |

---

## 23. TEAM CONTRIBUTIONS & RESPONSIBILITIES

| Team Member | Official Role & Contribution Status |
|:---|:---|
| **Dhanush AV** | **Team Leader / Primary Technical Implementation & Architecture** (Engineered microservices, Eureka registration, Spring Cloud Gateway, Resilience4j fault tolerance, Zipkin tracing, React UI, QA suite, and Vercel deployment). |
| **Upputuri Venkata Geethasri** | **Team Member 1** (*Individual contribution details to be confirmed by the team.*) |
| **Satish Kumar Verma** | **Team Member 2** (*Individual contribution details to be confirmed by the team.*) |
| **Prem Burnwal** | **Team Member 3** (*Individual contribution details to be confirmed by the team.*) |

---

## 24. CATEGORIZED ENHANCEMENTS

### Category A: Completed 4-Week Deliverables
- Dynamic Service Discovery (Eureka Server & Client).
- Non-blocking API Gateway Ingress (Spring Cloud Gateway).
- Resilience4j Protection (Circuit Breaker, Fallback, Retry, TimeLimiter, RateLimiter, Bulkhead).
- OpenZipkin Distributed Tracing (Micrometer Brave).
- React Monitoring & Chaos Control Dashboard.
- Live Vercel Edge Production Deployment.

### Category B: Future Improvements
- **Persistent Database**: Transition mock memory catalog arrays to PostgreSQL / MySQL with Spring Data JPA.
- **Asynchronous Messaging**: Integrate Apache Kafka for event-driven ordering workflows.
- **Prometheus & Grafana**: Deploy metric scraping and Grafana dashboards for long-term historical metrics visualization.

---

## 25. CONCLUSION

The **CircuitBreaker** platform successfully fulfills all **Week 1**, **Week 2**, **Week 3**, and **Week 4** requirements established in the official Axlero project specification. By combining Spring Cloud Gateway ingress and Netflix Eureka service discovery with a defense-in-depth Resilience4j pipeline and OpenZipkin distributed tracing, the system guarantees high availability, graceful degradation, and full observability.

All features have been validated across 22 QA test scenarios and are deployed live at [https://circuit-breaker-one.vercel.app/](https://circuit-breaker-one.vercel.app/).

---

## 26. REFERENCES & VERIFIED ARTIFACTS

1. **GitHub Repository**: [https://github.com/dhanush200322/CircuitBreaker](https://github.com/dhanush200322/CircuitBreaker)
2. **Live Production Deployment**: [https://circuit-breaker-one.vercel.app/](https://circuit-breaker-one.vercel.app/)
3. **Official Project Specification**: `PROJECT_SPEC.md`
4. **Comprehensive System Architecture**: `docs/ARCHITECTURE.md`
5. **Formal QA Test Report**: `docs/QA_REPORT.md`
6. **Production Operations Runbook**: `docs/RUNBOOK.md`

---

## 27. APPENDIX: AXLERO 4-WEEK FINAL REVIEW CHECKLIST

| Week | Requirement | Verification Source / Evidence | Status |
|:---:|:---|:---|:---:|
| **W1** | Product Catalog Microservice | `product-service` (`:8081`) | **COMPLETED** |
| **W1** | Inventory Microservice | `inventory-service` (`:8082`) | **COMPLETED** |
| **W1** | Recommendation Microservice | `recommendation-service` (`:8083`) | **COMPLETED** |
| **W1** | Eureka Service Registry | `service-registry` (`:8080`) | **COMPLETED** |
| **W1** | Spring Cloud API Gateway | `api-gateway` (`:8084`) | **COMPLETED** |
| **W1** | Dynamic Route Resolution | `discovery.locator.enabled=true` | **COMPLETED** |
| **W2** | Resilience4j Integration | `recommendation-service/pom.xml` | **COMPLETED** |
| **W2** | Circuit Breaker Setup | `slidingWindowSize=5`, `failureRateThreshold=50%` | **COMPLETED** |
| **W2** | Graceful Fallback Handler | `RecommendationController.java` fallback method | **COMPLETED** |
| **W2** | React Chaos Monitoring UI | `circuitbreaker-frontend` Chaos Controls | **COMPLETED** |
| **W2** | Failure Chaos Simulation | QA-010 (`?fail=true` returns `HTTP 200 OK`) | **COMPLETED** |
| **W3** | Resilience4j Rate Limiter | `limitForPeriod=2`, `limitRefreshPeriod=10s` | **COMPLETED** |
| **W3** | Resilience4j Bulkhead | `maxConcurrentCalls=1` | **COMPLETED** |
| **W3** | Actuator Resilience Metrics | `/actuator/metrics/resilience4j.*` endpoints | **COMPLETED** |
| **W4** | Micrometer & Zipkin Tracing | `openzipkin/zipkin` (`:9411`), Brave exporter | **COMPLETED** |
| **W4** | Latency & TimeLimiter Timeout | QA-012 (`?delay=3000`, `timeoutDuration=2s`) | **COMPLETED** |
| **W4** | Frontend Trace Waterfall | `TracingCard.tsx` Zipkin API integration | **COMPLETED** |
| **W1–4**| Live Production Deployment | Public Vercel Edge URL | **COMPLETED** |

---
*Report verified strictly against the CircuitBreaker project repository, codebase, configuration files, QA report, and live deployment.*
