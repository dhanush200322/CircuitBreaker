# CircuitBreaker â€” Cloud-Native Resilience & Distributed Tracing Platform

---

## Executive Summary

**CircuitBreaker** is an enterprise-grade cloud-native microservices architecture designed to demonstrate proactive fault tolerance, dynamic service discovery, intelligent edge routing, distributed request tracing, and real-time observability in high-throughput distributed systems.

Built using **Java 17**, **Spring Boot 3.2.5**, **Spring Cloud (2023.0.1)**, **Netflix Eureka**, **Spring Cloud Gateway**, and **Resilience4j**, paired with **OpenZipkin** and a modern **React 19 / TypeScript / Tailwind CSS** monitoring dashboard, the project demonstrates how distributed systems can survive cascading failures, thread pool starvation, intermittent network drops, and extreme latency spikes without degrading end-user experience.

---

## The Problem

In traditional monolithic-to-microservices migrations:
1. **Cascading Failures**: When a single downstream service degrades or experiences a latency spike, upstream callers block waiting for responses. This exhausts thread pools, monopolizes connections, and triggers catastrophic outages across entirely unrelated business domains.
2. **Brittle Network Topologies**: Hardcoding hostnames, IP addresses, or static load balancers creates single points of failure and prevents seamless horizontal scaling.
3. **Observability Blind Spots**: When a request traverses multiple independent network boundaries, debugging latency bottlenecks or intermittent 500 errors without unified distributed context becomes nearly impossible.
4. **Poor User Experience**: Unhandled server exceptions result in raw 500 status codes, broken shopping carts, and degraded customer trust.

---

## The Solution

CircuitBreaker addresses these challenges by implementing an end-to-end resilient architecture:
- **Centralized Service Discovery**: Netflix Eureka dynamically registers and discovers microservice instances, removing static network configuration.
- **Reactive Edge Routing**: Spring Cloud Gateway acts as a non-blocking ingress controller with automatic discovery locator mapping.
- **Multi-Layered Resilience4j Pipeline**: Enforces a strict defense-in-depth pipeline (Circuit Breakers, Timeouts, Retries, Rate Limiters, and Bulkheads) to isolate faults immediately.
- **Graceful Fallbacks**: Guarantees that clients receive sanitized fallback responses (`HTTP 200 OK`) instead of system errors when downstream components fail.
- **End-to-End Distributed Tracing**: Micrometer Tracing and Zipkin propagate W3C/B3 trace headers across all network hops, exposing the exact duration of each internal execution step.
- **Real-Time Glassmorphic Dashboard**: A high-performance React dashboard provides live visibility into service health, actuator metrics, circuit breaker states, and chaos experiment results.

---

## Architecture at a Glance

```text
[ React Monitoring Dashboard ] (:5173 / :5175)
             â”‚
             â”‚ HTTP / REST API (Vite Proxy)
             â–¼
[ Spring Cloud API Gateway ] (:8084)
             â”‚
             â”œâ”€â”€ Query Discovery Cache â”€â”€â–º [ Eureka Service Registry ] (:8080)
             â”‚
             â”œâ”€â”€ Route: /product-service/** â”€â”€â”€â”€â”€â”€â”€â”€â”€â–º [ Product Service ] (:8081)
             â”œâ”€â”€ Route: /inventory-service/** â”€â”€â”€â”€â”€â”€â”€â–º [ Inventory Service ] (:8082)
             â””â”€â”€ Route: /recommendation-service/** â”€â”€â–º [ Recommendation Service ] (:8083)
                                                                 â”‚
                                                       [ Resilience4j Layer ]
                                                       - Circuit Breaker (50% threshold)
                                                       - Graceful Fallback
                                                       - Retry (3 attempts)
                                                       - TimeLimiter (2s timeout)
                                                       - RateLimiter (2 req / 10s)
                                                       - Bulkhead (max 1 concurrent)
                                                                 â”‚
                                                       Distributed Spans Export
                                                                 â–¼
                                                       [ Zipkin Tracing ] (:9411)
```

---

## Key Technologies & Frameworks

| Domain | Technology Stack |
|:---|:---|
| **Core Backend** | Java 17 (LTS), Spring Boot `3.2.5`, Spring Framework 6 |
| **Microservices Cloud** | Spring Cloud `2023.0.1`, Spring Cloud Gateway (WebFlux / Netty), Spring Cloud Netflix Eureka |
| **Resilience & AOP** | Resilience4j `2.2.0` (`resilience4j-spring-boot3`, `spring-boot-starter-aop`) |
| **Observability** | Spring Boot Starter Actuator, Micrometer Tracing Brave, Zipkin Reporter Brave |
| **Tracing Server** | OpenZipkin `3.4.1` (Docker / Standalone JAR) |
| **Frontend UI** | React `19.2.8`, TypeScript `6.0.2`, Vite `8.2.0`, Tailwind CSS `4.3.3`, PostCSS |
| **Build & QA** | Apache Maven (Multi-Module), Oxlint, PowerShell Automated Test Suite |

---

## Resilience Patterns Demonstrated

1. **Circuit Breaker**: Evaluates a 5-call sliding window. If failure rate exceeds 50%, transitions from `CLOSED` to `OPEN`, immediately short-circuiting calls for 5 seconds before testing health in `HALF_OPEN` state.
2. **Graceful Fallback**: Intercepts unhandled exceptions and timeouts to return a clean, static fallback payload (`HTTP 200 OK`) preventing client errors.
3. **Smart Retry**: Automatically attempts up to 3 execution attempts with 1-second backoff intervals for transient exceptions.
4. **TimeLimiter (Timeout)**: Enforces a strict 2.0-second asynchronous boundary on CompletableFuture executions to prevent thread blocking.
5. **Rate Limiter**: Enforces a 2-request quota per 10-second refresh period to defend downstream dependencies from traffic bursts.
6. **Bulkhead**: Restricts concurrent executions to a maximum of 1 active call, isolating CPU/memory resources and rejecting excess concurrency with instant fallback.

---

## Measurable Results & Verified QA Impact

During rigorous local testing and automated chaos verification:
- **100% Availability**: Injected downstream exceptions (`?fail=true`) and extreme latencies (`?delay=3000`) resulted in **0% HTTP 500 error rates**, delivering 100% successful fallback responses to the frontend.
- **Trace Transparency**: Zipkin captured full execution timelines (e.g. an **8.093-second** trace capturing Gateway ingress, client forwarding, timeout triggers, and retry cycles across 3 distributed spans).
- **Concurrency Protection**: Bulkhead testing confirmed available execution slots dropped from `1.0` to `0.0` during active saturation, safely rejecting overlapping requests.

---

## Resume & Portfolio Snippets

### Bullet Points for Software Engineer Resume:
- *Designed and developed a cloud-native microservices platform using Java 17, Spring Boot 3, and Spring Cloud Gateway, implementing dynamic service discovery with Netflix Eureka to eliminate static IP dependencies.*
- *Engineered a multi-layered fault-tolerance architecture using Resilience4j (Circuit Breaker, Fallback, Retry, TimeLimiter, RateLimiter, Bulkhead), achieving 100% graceful degradation under simulated chaos.*
- *Integrated end-to-end distributed tracing across reactive API Gateway and microservices using Micrometer Tracing, Brave, and Zipkin, enabling sub-millisecond bottleneck isolation.*
- *Built a real-time monitoring dashboard in React 19, TypeScript, and Tailwind CSS, providing live visualization of Actuator metrics, circuit breaker transitions, and distributed trace summaries.*

### Short LinkedIn / Portfolio Summary:
> **CircuitBreaker â€” Cloud-Native Resilience & Observability Platform**
> *A Spring Boot 3 & Spring Cloud microservices architecture demonstrating enterprise fault tolerance and distributed tracing. Features non-blocking API Gateway routing, Netflix Eureka dynamic discovery, Resilience4j resilience patterns (Circuit Breakers, Timeouts, Retries, Bulkheads, Fallbacks), Zipkin distributed tracing, and a real-time React monitoring dashboard with interactive chaos engineering controls.*
