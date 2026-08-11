# CircuitBreaker — Resilient Java Microservices Platform

[![Java](https://img.shields.io/badge/Java-17-orange.svg)](https://adoptium.net/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.5-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Spring Cloud](https://img.shields.io/badge/Spring%20Cloud-2023.0.1-blue.svg)](https://spring.io/projects/spring-cloud)
[![Resilience4j](https://img.shields.io/badge/Resilience4j-2.2.0-red.svg)](https://resilience4j.readme.io/)
[![Zipkin](https://img.shields.io/badge/Zipkin-Distributed%20Tracing-purple.svg)](https://zipkin.io/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED.svg)](https://www.docker.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Production%20Deployment-black.svg)](https://circuit-breaker-one.vercel.app/)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6.svg)](https://www.typescriptlang.org/)

A cloud-native microservices platform built to demonstrate enterprise-grade fault tolerance, dynamic service discovery, reactive edge routing, end-to-end distributed tracing, and live observability metrics.

---

## 🎥 Project Demo

> Full video demonstration of the CircuitBreaker microservices architecture, live chaos testing, failure fallbacks, and distributed tracing.

[Watch the full project demonstration](https://github.com/dhanush200322/CircuitBreaker/blob/main/circuitbreaker-frontend/videos/0811.mp4)

*For the complete spoken walkthrough and presentation guide, see [`docs/VIDEO-DEMO-SCRIPT.md`](docs/VIDEO-DEMO-SCRIPT.md).*

---

## Table of Contents

- [Overview & Objectives](#overview--objectives)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Microservices Roster](#microservices-roster)
- [Resilience Engineering & Circuit Breakers](#resilience-engineering--circuit-breakers)
- [Chaos Engineering & Failure Simulation](#chaos-engineering--failure-simulation)
- [Live Production Deployment](#live-production-deployment)
- [Important Deployment Notes](#important-deployment-notes)
- [Local Installation & Setup](#local-installation--setup)
- [Verification & Testing Commands](#verification--testing-commands)
- [How I Explain This Project in an Interview](#how-i-explain-this-project-in-an-interview)
- [Key Project Highlights](#key-project-highlights)
- [Documentation Index](#documentation-index)

---

## Overview & Objectives

In distributed systems, downstream network partitions, transient errors, and latency spikes are inevitable. Without resilience mechanisms, a single slow or failing service can trigger cascading failures across an entire infrastructure, exhausting thread pools and causing catastrophic outages.

The **CircuitBreaker** platform demonstrates a self-healing microservices architecture designed to solve these challenges:

- **Dynamic Service Discovery:** Decouples microservice locations using Netflix Eureka so services register and discover each other dynamically without static IP dependencies.
- **Reactive Edge Routing:** Uses Spring Cloud Gateway to provide single-entry routing, client-side load balancing, and trace propagation.
- **Multi-Layered Fault Tolerance:** Implements Resilience4j Circuit Breakers, Smart Retries, TimeLimiters (timeouts), Bulkheads, and Rate Limiters on critical endpoints.
- **Graceful Degradation & Fallbacks:** Guarantees that failing downstream calls return valid, degraded responses (HTTP 200) instead of raw 500 error cascades.
- **Distributed Tracing:** Propagates W3C/B3 context across service boundaries with Micrometer Tracing and OpenZipkin to track request waterfalls and latency bottlenecks.
- **Live Observability:** Visualizes real-time Actuator metrics, circuit breaker states, and live trace IDs on a reactive React dashboard.

---

## System Architecture

```text
User Browser
    │
    ▼
Vercel Frontend (https://circuit-breaker-one.vercel.app)
    │
    ├─────────────────────────────┬─────────────────────────────┐
    │ /gateway/*                  │ /eureka-api/*               │ /zipkin/*
    ▼                             ▼                             ▼
Cloudflare Quick Tunnel       Cloudflare Quick Tunnel       Cloudflare Quick Tunnel
(API Gateway Ingress)         (Eureka Ingress)              (Zipkin Ingress)
    │                             │                             │
    ▼                             ▼                             ▼
Spring Cloud Gateway          Eureka Service Registry       OpenZipkin Server
(Port: 8084)                  (Port: 8080)                  (Port: 9411)
    │                             ▲                             ▲
    │                             │ Service Heartbeats          │ Trace Spans
    ├──── Eureka Discovery ───────┤                             │
    │                             │                             │
    ├───► Product Service ────────┴─────────────────────────────┤
    │     (Port: 8081)                                          │
    │                                                           │
    ├───► Inventory Service ──────┬─────────────────────────────┤
    │     (Port: 8082)            │                             │
    │                             │                             │
    └───► Recommendation Service ─┴─────────────────────────────┘
          (Port: 8083)
               │
               ├── Resilience4j (CircuitBreaker, Retry, TimeLimiter)
               └── Spring Boot Actuator (Live Metrics)
```

### Docker Compose Multi-Container Stack

```text
Docker Compose Network (circuitbreaker-network)
 ├── service-registry        :8080  (Netflix Eureka Server)
 ├── api-gateway             :8084  (Spring Cloud Gateway Edge)
 ├── product-service         :8081  (Product Catalog Microservice)
 ├── inventory-service       :8082  (Stock Validation Microservice)
 ├── recommendation-service  :8083  (Recommendation Engine + Resilience4j)
 └── zipkin                  :9411  (OpenZipkin Distributed Tracing)
```

---

## Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend UI** | React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons |
| **Edge & API Gateway** | Spring Cloud Gateway (Reactive / Spring WebFlux) |
| **Service Discovery** | Spring Cloud Netflix Eureka Server & Client |
| **Fault Tolerance** | Resilience4j 2.2.0 (`CircuitBreaker`, `Retry`, `TimeLimiter`, `Bulkhead`, `RateLimiter`) |
| **Backend Framework** | Java 17 (LTS), Spring Boot 3.2.5, Spring Boot Starter Actuator |
| **Distributed Tracing** | Micrometer Tracing Bridge Brave, Zipkin Reporter Brave, OpenZipkin |
| **Containerization** | Docker, Docker Compose, Multi-Stage Java Builds |
| **Cloud & Ingress** | Vercel Edge Hosting, Cloudflare Quick Ingress Tunnels, GitHub Actions / Git CI |

---

## Microservices Roster

| Service Name | Port | Technology | Primary Responsibility |
| :--- | :---: | :--- | :--- |
| **Eureka Registry** | `8080` | Spring Cloud Netflix Eureka | Dynamic instance registration, health checks, and service lookup directory. |
| **Product Service** | `8081` | Spring Boot 3 Web | Manages and serves the product catalog data (`/products`). |
| **Inventory Service** | `8082` | Spring Boot 3 Web | Manages stock verification and warehouse quantities (`/inventory/{id}`). |
| **Recommendation Service** | `8083` | Spring Boot 3, Resilience4j | Generates product add-ons; houses the Resilience4j fault-tolerance pipeline. |
| **API Gateway** | `8084` | Spring Cloud Gateway | Edge proxy, Eureka discovery locator routing, and span context propagation. |
| **Zipkin Server** | `9411` | OpenZipkin Container | Ingests, indexes, and visualizes cross-service distributed trace waterfalls. |
| **Monitoring Dashboard** | `5173` | React 19, Vite, TypeScript | Real-time observability dashboard, chaos injection controls, and metric charts. |

---

## Resilience Engineering & Circuit Breakers

The **Recommendation Service** acts as our resilience testbed. Its endpoints are guarded by Resilience4j aspects executed in strict hierarchical order:

```java
@GetMapping("/{productId}")
@CircuitBreaker(name = "recommendationService", fallbackMethod = "fallbackRecommendations")
@RateLimiter(name = "recommendationService")
@Bulkhead(name = "recommendationService")
@Retry(name = "recommendationService")
@TimeLimiter(name = "recommendationService")
public CompletableFuture<RecommendationResponse> getRecommendations(...) {
    // Asynchronous business logic wrapped in CompletableFuture
}
```

### Circuit Breaker State Lifecycle

```text
    ┌────────────────────────────────────────────────────────┐
    │                                                        │
    ▼                                                        │
┌─────────┐   Failure Rate > 50%   ┌──────┐   Wait Duration (5s)   ┌───────────┐   Recovery Pass   ┌─────────┐
│ CLOSED  │ ─────────────────────► │ OPEN │ ─────────────────────► │ HALF-OPEN │ ────────────────► │ CLOSED  │
└─────────┘                        └──────┘                        └───────────┘                   └─────────┘
     ▲                                                                   │
     │                         Recovery Failed                           │
     └───────────────────────────────────────────────────────────────────┘
```

1. **CLOSED (Healthy):** Requests execute normally. Call durations and outcomes are measured within a sliding window of 5 calls.
2. **FAILURE SPIKE:** When the failure rate reaches or exceeds **50%**, the Circuit Breaker trips to protect downstream resources.
3. **OPEN (Failing Fast):** All subsequent calls are immediately blocked from hitting downstream logic and redirected to the `fallbackRecommendations` handler without network overhead.
4. **HALF-OPEN (Probing):** After a 5-second wait duration, the circuit transitions to HALF-OPEN and permits 3 trial calls to assess downstream health.
5. **RECOVERY / RETRIP:** If all trial calls succeed, the circuit returns to **CLOSED**; if any trial call fails, it reverts to **OPEN**.

---

## Chaos Engineering & Failure Simulation

The platform provides built-in query parameters and dedicated UI controls to inject chaos and observe resilience behavior in real time:

| Test Case | Trigger Endpoint | Injected Behavior | Observed System Response |
| :--- | :--- | :--- | :--- |
| **Normal Request** | `GET /recommendations/1` | Standard healthy execution. | `HTTP 200 OK`<br>`["Accessories", "Extended Warranty"]` in ~15ms. |
| **Trigger Failure** | `GET /recommendations/1?fail=true` | Injects an instant `RuntimeException`. | `HTTP 200 OK (Fallback)`<br>Retries 3x, catches exception, returns `"No recommendations available at this time (Fallback)"`. |
| **Trigger Latency** | `GET /recommendations/1?delay=3000` | Injects 3000ms delay (> 2s limit). | `HTTP 200 OK (Fallback)`<br>TimeLimiter cancels thread at 2.0s, retries, and gracefully returns fallback. |

---

## Live Production Deployment

- **Production Dashboard:** [https://circuit-breaker-one.vercel.app/](https://circuit-breaker-one.vercel.app/)
- **API Routing:** Handled through Vercel edge rewrites (`/gateway/*`, `/eureka-api/*`, `/zipkin/*`) forwarding to Cloudflare Ingress Tunnels.
- **Production Status:** Fully operational with live Eureka registration, Spring Cloud Gateway routing, live Actuator statistics, and Zipkin distributed traces.

---

## Important Deployment Notes

> [!NOTE]
> **Hybrid Edge Topology:**
> 1. **Vercel Frontend:** Permanently hosted globally on Vercel's Edge Network.
> 2. **Java Microservices Backend:** Runs locally in a multi-container Docker Compose network on the developer host.
> 3. **Cloudflare Quick Tunnels:** Provide zero-cost, no-credit-card HTTPS ingress bridging Vercel edge rewrites to the local Docker containers.
> 4. **Session Persistence:** Quick Tunnels are ephemeral and designed for portfolio demonstrations and active test sessions. The host machine and `cloudflared` terminals must remain active during live evaluations.

---

## Local Installation & Setup

### Prerequisites
- **Java 17 (JDK)**
- **Apache Maven 3.8+**
- **Docker & Docker Compose**
- **Node.js 18+ & npm**

### 1. Clone the Repository
```bash
git clone https://github.com/dhanush200322/CircuitBreaker.git
cd CircuitBreaker
```

### 2. Start the Backend Stack with Docker Compose
```bash
docker compose up --build -d
```
*This starts Eureka (8080), Zipkin (9411), Product (8081), Inventory (8082), Recommendation (8083), and Gateway (8084).*

Verify containers:
```bash
docker compose ps
```

### 3. Start the Frontend Dashboard
```bash
cd circuitbreaker-frontend
npm install
npm run dev
```
*Access the local dashboard at `http://localhost:5173`.*

---

## Verification & Testing Commands

Execute these verification commands against your environment:

```powershell
# 1. Product Catalog via Gateway
curl.exe -i http://localhost:8084/product-service/products

# 2. Inventory Check via Gateway
curl.exe -i http://localhost:8084/inventory-service/inventory/1

# 3. Recommendation Service (Normal)
curl.exe -i http://localhost:8084/recommendation-service/recommendations/1

# 4. Chaos Failure & Fallback Injection
curl.exe -i "http://localhost:8084/recommendation-service/recommendations/1?fail=true"

# 5. Chaos Latency & Timeout Injection
curl.exe -i "http://localhost:8084/recommendation-service/recommendations/1?delay=3000"

# 6. Live Resilience4j Circuit Breaker Metrics
curl.exe -s "http://localhost:8084/recommendation-service/actuator/metrics/resilience4j.circuitbreaker.calls?tag=name:recommendationService"

# 7. Eureka Service Discovery Registry
curl.exe -s -H "Accept: application/json" http://localhost:8080/eureka/apps

# 8. Zipkin Traced Services
curl.exe -s http://localhost:9411/api/v2/services
```

---

## How I Explain This Project in an Interview

> *"In this project, I designed a resilient microservices architecture to solve cascading failure and latency propagation issues in distributed systems.*
>
> *The backend consists of five Spring Boot 3 services managed in Docker Compose. I used Netflix Eureka for dynamic service discovery and Spring Cloud Gateway as a reactive entry point that routes client traffic dynamically without hardcoded service IPs.*
>
> *For resilience, I implemented Resilience4j on our Recommendation Service using a defense-in-depth pipeline: Circuit Breaker, Smart Retry, and TimeLimiter timeouts. When downstream services fail or experience high latency, the system fails fast, isolates thread pools, and gracefully returns fallback payloads with an HTTP 200 rather than crashing or showing a 500 error to the client.*
>
> *For observability, every service exports trace spans using Micrometer and Brave into OpenZipkin, allowing us to inspect end-to-end distributed waterfall traces across network boundaries. I also built a real-time React dashboard deployed on Vercel that streams live Actuator metrics and lets you trigger chaos tests to watch the circuit breaker and distributed traces react in real time."*

---

## Key Project Highlights

- **Microservices Architecture:** 5 decoupled Spring Boot 3 microservices communicating over internal Docker networking.
- **Dynamic Service Discovery:** Netflix Eureka registration eliminating static port dependencies.
- **Reactive Edge Gateway:** Spring Cloud Gateway with dynamic service locator routing and context propagation.
- **Resilience4j Fault Tolerance:** Configured Circuit Breakers, Smart Retries, TimeLimiters, Bulkheads, and Fallbacks.
- **Graceful Degradation:** Automatic fallback responses preventing client-facing errors during outages.
- **Distributed Tracing:** B3/W3C context propagation and span waterfall analysis via OpenZipkin.
- **Runtime Observability:** Live Spring Boot Actuator resilience metrics streamed to the UI.
- **Interactive Chaos Engineering:** On-demand failure and latency injection controls.
- **Production Edge Deployment:** Hybrid deployment on Vercel with Cloudflare Ingress Tunnels.

---

## Documentation Index

- 📖 [Comprehensive Architecture Deep-Dive](docs/ARCHITECTURE.md)
- 🎬 [3–5 Minute Video Demonstration Script](docs/VIDEO-DEMO-SCRIPT.md)
- ✅ [Video Recording & QA Checklist](docs/VIDEO-CHECKLIST.md)
- 📡 [Complete REST API Reference Manual](docs/API_REFERENCE.md)
- 🧪 [Formal QA & Validation Report](docs/QA_REPORT.md)
- 💼 [Technical Interview & Viva Preparation Guide](docs/INTERVIEW_GUIDE.md)

---

## License
MIT License. Free for educational and portfolio demonstration use.
