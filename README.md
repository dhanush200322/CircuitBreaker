# CircuitBreaker â€” Cloud-Native Resilience & Distributed Tracing Platform

[![Java](https://img.shields.io/badge/Java-17-orange.svg)](https://adoptium.net/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.5-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Spring Cloud](https://img.shields.io/badge/Spring%20Cloud-2023.0.1-blue.svg)](https://spring.io/projects/spring-cloud)
[![Resilience4j](https://img.shields.io/badge/Resilience4j-2.2.0-red.svg)](https://resilience4j.readme.io/)
[![Zipkin](https://img.shields.io/badge/Zipkin-Distributed%20Tracing-purple.svg)](https://zipkin.io/)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-yellow.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-cyan.svg)](https://tailwindcss.com/)

A cloud-native microservices architecture demonstrating enterprise-grade resilience patterns, dynamic service discovery, intelligent API gateway routing, end-to-end distributed tracing, chaos engineering, and a real-time React monitoring dashboard.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Services & Port Allocation](#services--port-allocation)
- [Technology Stack](#technology-stack)
- [Resilience Architecture](#resilience-architecture)
- [End-to-End Request Flow](#end-to-end-request-flow)
- [API Reference & Examples](#api-reference--examples)
- [Chaos Engineering & Fault Injection](#chaos-engineering--fault-injection)
- [Distributed Tracing & Observability](#distributed-tracing--observability)
- [React Monitoring Dashboard](#react-monitoring-dashboard)
- [Local Setup & Running](#local-setup--running)
- [Verification & Testing](#verification--testing)
- [QA Summary](#qa-summary)
- [Project Directory Structure](#project-directory-structure)
- [Future Improvements](#future-improvements)
- [Documentation Index](#documentation-index)

---

## Overview

In modern distributed microservices architectures, network partitions, cascading failures, downstream latencies, and intermittent service crashes are inevitable. The **CircuitBreaker** platform demonstrates how to build resilient, self-healing backend systems using **Spring Boot 3**, **Spring Cloud Gateway**, **Netflix Eureka**, and **Resilience4j**, paired with full-stack observability via **Micrometer Tracing**, **Zipkin**, and a dedicated **React Monitoring & Chaos Dashboard**.

The project simulates an e-commerce platform where product catalog queries and inventory lookups route through an intelligent API Gateway to independent microservices. The **Recommendation Service** acts as a fault-tolerance testbed, implementing six key resilience patterns (Circuit Breaker, Fallback, Retry, TimeLimiter, RateLimiter, and Bulkhead) to guarantee system availability even under heavy failure and extreme latency conditions.

---

## Key Features

- **Dynamic Service Discovery**: Centralized registration using Spring Cloud Netflix Eureka for automatic instance discovery without static host/port dependencies.
- **Intelligent API Gateway**: Reactive edge gateway built on Spring Cloud Gateway (WebFlux) providing unified routing, dynamic service locator integration, and trace context propagation.
- **Resilience4j Fault Tolerance**:
  - **Circuit Breaker**: Detects failure rates and opens the circuit to fail fast and protect downstream dependencies.
  - **Graceful Fallback**: Returns degraded yet valid responses (HTTP 200 with fallback payload) preventing client-facing 500 errors.
  - **Smart Retry**: Automatically retries transient exceptions up to 3 times with exponential backoff intervals.
  - **TimeLimiter (Timeout)**: Enforces a strict 2-second timeout window on asynchronous execution to prevent connection exhaustion.
  - **Rate Limiter**: Enforces API throughput limits (2 requests per 10-second period) to defend against burst traffic.
  - **Bulkhead**: Limits concurrent execution (max 1 concurrent call) to isolate resource pools and prevent thread pool starvation.
- **Distributed Tracing with Zipkin**: End-to-end span propagation across the API Gateway and downstream microservices using W3C/B3 context propagation via Micrometer Tracing and Brave.
- **Chaos Engineering Controls**: Dedicated interactive UI and API query parameters (`?fail=true`, `?delay=3000`) for on-demand failure injection and latency simulation.
- **Real-Time Monitoring Dashboard**: Dark-mode glassmorphic React 19 interface tracking microservice health, real-time Resilience4j actuator metrics, live circuit breaker states, and exact Zipkin trace summaries.

---

## System Architecture

```text
                               +----------------------------------+
                               |     React Monitoring Dashboard   |
                               |          (Port: 5173/5175)       |
                               +-----------------+----------------+
                                                 |
                         HTTP / REST API Requests |  (Vite Proxy)
                                                 v
                               +----------------------------------+
                               |        Spring Cloud Gateway      |
                               |            (Port: 8084)          |
                               +--------+----------------+--------+
                                        |                |
                Dynamic Discovery Queries|                | Routes Traffic
                                        v                |
                        +---------------+----+           |
                        |   Eureka Registry  |           |
                        |    (Port: 8080)    |           |
                        +---------------+----+           |
                                        ^                |
                Service Registrations   |                |
          +-----------------------------+----------------+-----------------------------+
          |                             |                                              |
          v                             v                                              v
+-------------------+         +--------------------+                        +--------------------+
|  Product Service  |         |  Inventory Service |                        |   Recommendation   |
|   (Port: 8081)    |         |    (Port: 8082)    |                        |      Service       |
+---------+---------+         +---------+----------+                        |    (Port: 8083)    |
          |                             |                                   +---------+----------+
          |                             |                                             |
          |                             |   [Resilience4j Layer]                      |
          |                             |   - Circuit Breaker (slidingWindow: 5)      |
          |                             |   - Fallback Method                         |
          |                             |   - Retry (maxAttempts: 3)                  |
          |                             |   - TimeLimiter (timeout: 2s)               |
          |                             |   - RateLimiter (2 req / 10s)               |
          |                             |   - Bulkhead (maxConcurrent: 1)             |
          |                             |                                             |
          +-----------------------------+---------------------------------------------+
                                        |
                            Spans Export (HTTP POST)
                                        v
                               +-----------------+
                               |  Zipkin Server  |
                               |  (Port: 9411)   |
                               +-----------------+
```

---

## Services & Port Allocation

| Component | Port | Technology | Key Responsibility |
|:---|:---:|:---|:---|
| **Eureka Registry** | `8080` | Spring Cloud Netflix Eureka | Dynamic service directory, heartbeat monitoring, and instance location lookup. |
| **Product Service** | `8081` | Spring Boot 3 Web, Eureka Client | Serves product catalog queries (`/products`). |
| **Inventory Service** | `8082` | Spring Boot 3 Web, Eureka Client | Manages and validates item inventory stock levels (`/inventory/{productId}`). |
| **Recommendation Service** | `8083` | Spring Boot 3 Web, Resilience4j, Actuator | Generates product recommendations with Resilience4j circuit breakers & fallbacks. |
| **API Gateway** | `8084` | Spring Cloud Gateway (WebFlux) | Edge routing, reverse proxying, Eureka discovery locator, and trace propagation. |
| **Zipkin Tracing** | `9411` | OpenZipkin Server | Ingests, indexes, and visualizes distributed spans across microservices. |
| **Frontend Dashboard** | `5173` / `5175` | React 19, TypeScript, Vite, Tailwind CSS | Real-time resilience metrics visualization, chaos trigger buttons, and trace inspector. |

---

## Technology Stack

### Backend Stack
- **Language**: Java 17 (LTS)
- **Framework**: Spring Boot `3.2.5`
- **Cloud Infrastructure**: Spring Cloud `2023.0.1`
- **Service Discovery**: Spring Cloud Starter Netflix Eureka Client / Server
- **API Gateway**: Spring Cloud Starter Gateway (Reactive / Spring WebFlux)
- **Fault Tolerance**: Resilience4j `2.2.0` (`resilience4j-spring-boot3`, `spring-boot-starter-aop`)
- **Observability & Metrics**: Spring Boot Starter Actuator
- **Distributed Tracing**: Micrometer Tracing Bridge Brave (`io.micrometer:micrometer-tracing-bridge-brave`), Zipkin Reporter Brave (`io.zipkin.reporter2:zipkin-reporter-brave`)
- **Build Tool**: Apache Maven (Multi-Module Project Structure)

### Frontend Stack
- **Library**: React `19.2.8`
- **Language**: TypeScript `6.0.2`
- **Bundler & Dev Server**: Vite `8.2.0` (`@vitejs/plugin-react`)
- **Styling**: Tailwind CSS `4.3.3` with PostCSS and Autoprefixer
- **Linter**: Oxlint `1.75.0`

---

## Resilience Architecture

The Recommendation Service implements a multi-layered defense-in-depth resilience pipeline configured via `application.properties` and declared using AOP annotations on `RecommendationController`:

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
    // Business logic wrapped in CompletableFuture.supplyAsync(...)
}
```

### Configured Aspect Order
To ensure proper fault interception, aspects are ordered from outermost to innermost:
1. **CircuitBreaker (Order 1)**: Outermost aspect. Catches any exception (including RateLimiter, Bulkhead, TimeLimiter, and Retry failures) and redirects execution to `fallbackRecommendations`.
2. **RateLimiter (Order 2)**: Checks permission token availability (2 requests per 10s).
3. **Bulkhead (Order 3)**: Enforces concurrency limit (max 1 concurrent call).
4. **Retry (Order 4)**: Retries transient failures up to 3 times before propagating exception outward.
5. **TimeLimiter (Order 5)**: Innermost aspect. Enforces 2-second asynchronous timeout limit on the `CompletableFuture`.

### Detailed Configuration Parameters

```properties
# Circuit Breaker Configuration
resilience4j.circuitbreaker.instances.recommendationService.slidingWindowSize=5
resilience4j.circuitbreaker.instances.recommendationService.failureRateThreshold=50
resilience4j.circuitbreaker.instances.recommendationService.waitDurationInOpenState=5s
resilience4j.circuitbreaker.instances.recommendationService.permittedNumberOfCallsInHalfOpenState=3
resilience4j.circuitbreaker.instances.recommendationService.automaticTransitionFromOpenToHalfOpenEnabled=true

# Retry Configuration
resilience4j.retry.instances.recommendationService.maxAttempts=3
resilience4j.retry.instances.recommendationService.waitDuration=1s

# TimeLimiter Configuration
resilience4j.timelimiter.instances.recommendationService.timeoutDuration=2s
resilience4j.timelimiter.instances.recommendationService.cancelRunningFuture=true

# RateLimiter Configuration
resilience4j.ratelimiter.instances.recommendationService.limitForPeriod=2
resilience4j.ratelimiter.instances.recommendationService.limitRefreshPeriod=10s
resilience4j.ratelimiter.instances.recommendationService.timeoutDuration=0

# Bulkhead Configuration
resilience4j.bulkhead.instances.recommendationService.maxConcurrentCalls=1
resilience4j.bulkhead.instances.recommendationService.maxWaitDuration=0
```

---

## End-to-End Request Flow

```text
[Client / Frontend]
        |
        | 1. HTTP GET http://localhost:8084/recommendation-service/recommendations/1
        v
[API Gateway :8084]
        | 2. Extract / Generate Trace ID (B3 / W3C Propagation)
        | 3. Query Eureka for "RECOMMENDATION-SERVICE" host/port
        v
[Eureka Server :8080] ---> Returns "http://localhost:8083"
        |
        | 4. Forward request with HTTP Trace Headers (X-B3-TraceId, etc.)
        v
[Recommendation Service :8083]
        |
        +---> [RateLimiter Check] ---> Passed (Tokens available)
        |
        +---> [Bulkhead Check]    ---> Passed (Concurrent slots available)
        |
        +---> [CircuitBreaker]    ---> CLOSED State
        |
        +---> [Retry Wrapper]     ---> Attempt 1
        |
        +---> [TimeLimiter]       ---> Enforce 2s async timeout limit
        |
        +---> [Controller Logic]  ---> Return RecommendationResponse
        |
        | 5. Return HTTP 200 JSON
        v
[API Gateway :8084]
        |
        | 6. Return response to Client & emit Span to Zipkin
        v
[Client / Frontend] + [Zipkin :9411]
```

---

## API Reference & Examples

### 1. Direct Microservice Endpoints
```bash
# Product Service
curl -i http://localhost:8081/products

# Inventory Service
curl -i http://localhost:8082/inventory/1

# Recommendation Service (Normal)
curl -i http://localhost:8083/recommendations/1
```

### 2. API Gateway Routed Endpoints
```bash
# Route to Product Service
curl -i http://localhost:8084/product-service/products

# Route to Inventory Service
curl -i http://localhost:8084/inventory-service/inventory/1

# Route to Recommendation Service
curl -i http://localhost:8084/recommendation-service/recommendations/1
```

### 3. Actuator Metrics Endpoints
```bash
# Recommendation Service Health
curl -s http://localhost:8083/actuator/health

# Circuit Breaker Metrics
curl -s "http://localhost:8083/actuator/metrics/resilience4j.circuitbreaker.calls?tag=name:recommendationService"

# Bulkhead Available Concurrency
curl -s "http://localhost:8083/actuator/metrics/resilience4j.bulkhead.available.concurrent.calls?tag=name:recommendationService"
```

---

## Chaos Engineering & Fault Injection

The system includes built-in chaos endpoints to simulate real-world failure modes:

| Test Case | Request Endpoint | Simulated Behavior | System Response |
|:---|:---|:---|:---|
| **Normal Request** | `GET /recommendation-service/recommendations/1` | Standard healthy execution | `HTTP 200 OK`<br>`["Accessories", "Extended Warranty"]` |
| **Trigger Failure** | `GET /recommendation-service/recommendations/1?fail=true` | Server throws `RuntimeException` | `HTTP 200 OK (Fallback)`<br>`["No recommendations available at this time (Fallback)"]` |
| **Trigger Latency** | `GET /recommendation-service/recommendations/1?delay=3000` | Injects 3000ms delay (> 2s limit) | TimeLimiter triggers timeout -> Retried -> Fallback returned (~8s duration) |

---

## Distributed Tracing & Observability

All backend microservices export spans to Zipkin at `http://localhost:9411/api/v2/spans` with 100% sampling probability (`management.tracing.sampling.probability=1.0`).

### Verified Trace Scenarios
1. **Normal Request Trace**:
   - Total Spans: 3 (`api-gateway` server span, `api-gateway` client span, `recommendation-service` span)
   - Status: `HTTP 200 OK`
   - Latency: ~10â€“25 ms
2. **Latency Trace**:
   - Total Duration: `8.093s`
   - Span Breakdown:
     - `api-gateway`: 8.093s
     - `gateway client`: 8.088s
     - `recommendation-service`: 8.085s
   - Outcome: `HTTP 200 OK` with Fallback payload, accurately capturing timeout and retry cycles in a single trace ID.

---

## React Monitoring Dashboard

The frontend dashboard provides real-time operational visibility:

```text
+-------------------------------------------------------------------------------+
|  CIRCUITBREAKER MONITORING DASHBOARD               [SYSTEM ONLINE] [03:45 PM] |
+-------------------------------------------------------------------------------+
| SYSTEM OVERVIEW                                                               |
| [ Eureka :8080 ] [ Gateway :8084 ] [ Product :8081 ] [ Inventory :8082 ] ...  |
+------------------------------------+------------------------------------------+
| ZIPKIN TRACING                     | RESILIENCE4J METRICS                     |
| Status: UP (4 Services Traced)     | - Total Calls: 37                        |
| [Open Zipkin Button]               | - Failed Calls: 17                       |
|                                    | - Successful Calls: 20                   |
| CIRCUIT BREAKER                    | - Not Permitted: 0                       |
| State: CLOSED                      | - RateLimiter Available: 2               |
| Failure Rate: 0%                   | - Bulkhead Available: 1 / 1              |
+------------------------------------+------------------------------------------+
| CHAOS CONTROLS                                                                |
| [ Normal Request ]      [ Trigger Failure ]       [ Trigger Latency ]         |
|                                                                               |
| Last Request: Trigger Latency | Status: 200 | Duration: 8053ms                |
| [!] Fallback activated                                                        |
| JSON Output: { "recommendations": ["No recommendations available..."] }       |
|                                                                               |
| TRACE SUMMARY                                                                 |
| Trace ID: 670d8a4f91e2b3c4                                                    |
| Duration: 8085ms                                                              |
| Services: api-gateway -> recommendation-service                               |
+-------------------------------------------------------------------------------+
```

---

## Local Setup & Running

### Prerequisites
- **JDK 17** installed and configured on `PATH`
- **Apache Maven 3.8+**
- **Node.js 18+** & **npm**
- **Docker** (for Zipkin server)

### Step-by-Step Startup Sequence

#### Terminal 1: Start Zipkin Server
```powershell
docker run -d -p 9411:9411 --name zipkin openzipkin/zipkin
# Or run standalone jar: java -jar zipkin.jar
```

#### Terminal 2: Start Eureka Service Registry
```powershell
cd circuitbreaker-backend
mvn -pl service-registry spring-boot:run
```
*Wait ~10 seconds until Eureka is available on `http://localhost:8080`.*

#### Terminal 3: Start Product Service
```powershell
cd circuitbreaker-backend
mvn -pl product-service spring-boot:run
```

#### Terminal 4: Start Inventory Service
```powershell
cd circuitbreaker-backend
mvn -pl inventory-service spring-boot:run
```

#### Terminal 5: Start Recommendation Service
```powershell
cd circuitbreaker-backend
mvn -pl recommendation-service spring-boot:run
```

#### Terminal 6: Start API Gateway
```powershell
cd circuitbreaker-backend
mvn -pl api-gateway spring-boot:run
```

#### Terminal 7: Start React Frontend Dashboard
```powershell
cd circuitbreaker-frontend
npm install
npm run dev
```
*Dashboard will open at `http://localhost:5173`.*

---

## Verification & Testing

Verify that all services are operational using PowerShell:

```powershell
# 1. Verify Eureka Discovery
curl.exe -s http://localhost:8080/eureka/apps

# 2. Test API Gateway Routing
curl.exe -i http://localhost:8084/product-service/products
curl.exe -i http://localhost:8084/inventory-service/inventory/1
curl.exe -i http://localhost:8084/recommendation-service/recommendations/1

# 3. Test Chaos Failure & Fallback
curl.exe -i "http://localhost:8084/recommendation-service/recommendations/1?fail=true"

# 4. Test Timeout & Latency Handling
curl.exe -i "http://localhost:8084/recommendation-service/recommendations/1?delay=3000"

# 5. Verify Zipkin Traces Ingestion
curl.exe -s http://localhost:9411/api/v2/services
curl.exe -s "http://localhost:9411/api/v2/traces?serviceName=api-gateway&limit=1"
```

---

## QA Summary

| Verification Category | Status | Verified Result Summary |
|:---|:---:|:---|
| **Git Baseline & Integrity** | **PASS** | Clean working tree; `main` branch synchronized with remote. |
| **Eureka Service Discovery** | **PASS** | 4 application instances registered and healthy (`UP`). |
| **API Gateway Routing** | **PASS** | Seamless path routing across all three downstream services. |
| **Circuit Breaker & Fallback** | **PASS** | Instant graceful degradation returning HTTP 200 fallback response. |
| **TimeLimiter & Retries** | **PASS** | 2s timeout enforced, retries executed, graceful fallback returned. |
| **Bulkhead & Concurrency** | **PASS** | Max 1 concurrent execution strictly enforced; excess calls handled. |
| **Rate Limiter** | **PASS** | 2 requests per 10s quota enforced; remaining permissions visible. |
| **Distributed Tracing** | **PASS** | Gateway-to-service span context propagation validated in Zipkin. |
| **React Dashboard** | **PASS** | Real-time metrics polling, chaos triggers, and trace inspection active. |
| **Build Integrity** | **PASS** | Backend multi-module Maven build and frontend Vite build compile with zero errors. |

---

## Project Directory Structure

```text
CircuitBreaker/
â”œâ”€â”€ .gitignore
â”œâ”€â”€ README.md
â”œâ”€â”€ docs/
â”‚   â”œâ”€â”€ ARCHITECTURE.md
â”‚   â”œâ”€â”€ DEMO_GUIDE.md
â”‚   â”œâ”€â”€ QA_REPORT.md
â”‚   â”œâ”€â”€ INTERVIEW_GUIDE.md
â”‚   â”œâ”€â”€ API_REFERENCE.md
â”‚   â””â”€â”€ PROJECT_OVERVIEW.md
â”œâ”€â”€ circuitbreaker-backend/
â”‚   â”œâ”€â”€ pom.xml
â”‚   â”œâ”€â”€ service-registry/
â”‚   â”‚   â”œâ”€â”€ pom.xml
â”‚   â”‚   â””â”€â”€ src/main/
â”‚   â”‚       â”œâ”€â”€ java/com/circuitbreaker/serviceregistry/ServiceRegistryApplication.java
â”‚   â”‚       â””â”€â”€ resources/application.properties
â”‚   â”œâ”€â”€ api-gateway/
â”‚   â”‚   â”œâ”€â”€ pom.xml
â”‚   â”‚   â””â”€â”€ src/main/
â”‚   â”‚       â”œâ”€â”€ java/com/circuitbreaker/apigateway/ApiGatewayApplication.java
â”‚   â”‚       â””â”€â”€ resources/application.properties
â”‚   â”œâ”€â”€ product-service/
â”‚   â”‚   â”œâ”€â”€ pom.xml
â”‚   â”‚   â””â”€â”€ src/main/
â”‚   â”‚       â”œâ”€â”€ java/com/circuitbreaker/product/
â”‚   â”‚       â”‚   â”œâ”€â”€ ProductServiceApplication.java
â”‚   â”‚       â”‚   â”œâ”€â”€ ProductController.java
â”‚   â”‚       â”‚   â””â”€â”€ ProductResponse.java
â”‚   â”‚       â””â”€â”€ resources/application.properties
â”‚   â”œâ”€â”€ inventory-service/
â”‚   â”‚   â”œâ”€â”€ pom.xml
â”‚   â”‚   â””â”€â”€ src/main/
â”‚   â”‚       â”œâ”€â”€ java/com/circuitbreaker/inventory/
â”‚   â”‚       â”‚   â”œâ”€â”€ InventoryServiceApplication.java
â”‚   â”‚       â”‚   â”œâ”€â”€ InventoryController.java
â”‚   â”‚       â”‚   â””â”€â”€ InventoryResponse.java
â”‚   â”‚       â””â”€â”€ resources/application.properties
â”‚   â””â”€â”€ recommendation-service/
â”‚       â”œâ”€â”€ pom.xml
â”‚       â””â”€â”€ src/main/
â”‚           â”œâ”€â”€ java/com/circuitbreaker/recommendation/
â”‚           â”‚   â”œâ”€â”€ RecommendationServiceApplication.java
â”‚           â”‚   â”œâ”€â”€ RecommendationController.java
â”‚           â”‚   â””â”€â”€ RecommendationResponse.java
â”‚           â””â”€â”€ resources/application.properties
â””â”€â”€ circuitbreaker-frontend/
    â”œâ”€â”€ package.json
    â”œâ”€â”€ vite.config.ts
    â”œâ”€â”€ tailwind.config.js
    â”œâ”€â”€ src/
    â”‚   â”œâ”€â”€ App.tsx
    â”‚   â”œâ”€â”€ main.tsx
    â”‚   â”œâ”€â”€ components/
    â”‚   â”‚   â”œâ”€â”€ Header.tsx
    â”‚   â”‚   â”œâ”€â”€ ServiceStatusCard.tsx
    â”‚   â”‚   â”œâ”€â”€ CircuitBreakerCard.tsx
    â”‚   â”‚   â”œâ”€â”€ MetricsCard.tsx
    â”‚   â”‚   â”œâ”€â”€ TracingCard.tsx
    â”‚   â”‚   â””â”€â”€ ChaosControls.tsx
    â”‚   â”œâ”€â”€ pages/
    â”‚   â”‚   â””â”€â”€ Dashboard.tsx
    â”‚   â”œâ”€â”€ services/
    â”‚   â”‚   â””â”€â”€ api.ts
    â”‚   â””â”€â”€ types/
    â”‚       â””â”€â”€ resilience.ts
    â””â”€â”€ dist/
```

---

## Future Improvements

*(Future Work Roadmap)*
- **Persistent Database Layer**: Integrate Spring Data JPA with PostgreSQL / MySQL to replace in-memory collections.
- **Asynchronous Messaging**: Integrate Apache Kafka / RabbitMQ for event-driven cache invalidation.
- **Container Orchestration**: Add Dockerfiles for all microservices and a unified `docker-compose.yml` or Kubernetes Helm charts.
- **Centralized Configuration**: Add Spring Cloud Config Server backed by Git for dynamic property refresh.
- **Security**: Implement OAuth2 / OpenID Connect authentication using Spring Security and Keycloak at the API Gateway.

---

## Documentation Index

For comprehensive technical documentation, refer to the `docs/` directory:
- ðŸ“– [System Architecture Document](docs/ARCHITECTURE.md)
- ðŸŽ¬ [Interactive 5-Minute Demo Script](docs/DEMO_GUIDE.md)
- ðŸ§ª [Formal QA & Test Execution Report](docs/QA_REPORT.md)
- ðŸ’¼ [Engineering Interview & Viva Guide](docs/INTERVIEW_GUIDE.md)
- ðŸ“¡ [Complete API Reference Manual](docs/API_REFERENCE.md)
- ðŸ“„ [Executive Project Overview](docs/PROJECT_OVERVIEW.md)
