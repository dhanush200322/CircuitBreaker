# CircuitBreaker — Complete 4-Week Final Demonstration Guide

This document provides a step-by-step presentation script and live demonstration guide for showcasing the **CircuitBreaker** platform during the **Axlero 4-Week Final Project Review**, technical interviews, or stakeholder presentations.

---

## 4-Week Demonstration Sequence Summary (16 Steps)

| Step | Topic / Objective | Target Scope | Demonstration Scope | Key Visual / Action |
|:---:|:---|:---:|:---:|:---|
| **1** | Open Application & Environment Check | General | Live & Local | Open [https://circuit-breaker-one.vercel.app/](https://circuit-breaker-one.vercel.app/) or `localhost:5173` |
| **2** | System Architecture & Dashboard Overview | General | Live & Local | Inspect header, service status cards, and architecture map |
| **3** | Demonstrate Product Catalog Service | Week 1 | Live & Local | Query `/product-service/products` endpoint |
| **4** | Demonstrate Inventory Service | Week 1 | Live & Local | Query `/inventory-service/inventory/1` endpoint |
| **5** | Demonstrate Recommendation Service | Week 1 | Live & Local | Query `/recommendation-service/recommendations/1` endpoint |
| **6** | Demonstrate API Gateway Ingress Routing | Week 1 | Live & Local | Show dynamic path resolution via Spring Cloud Gateway (`:8084`) |
| **7** | Demonstrate Eureka Service Discovery | Week 1 | Live & Local | View Eureka registered instances (`API-GATEWAY`, `PRODUCT-SERVICE`, etc.) |
| **8** | Trigger Chaos Service Failure | Week 2 | Live & Local | Click **Trigger Failure** (`?fail=true`) on Chaos Controls |
| **9** | Demonstrate Circuit Breaker State Machine | Week 2 | Live & Local | Observe `CLOSED` → `OPEN` → `HALF-OPEN` → `CLOSED` transition |
| **10** | Demonstrate Graceful Fallback Execution | Week 2 | Live & Local | Verify client receives `HTTP 200 OK` fallback JSON payload |
| **11** | Demonstrate Rate Limiting Protection | Week 3 | Live & Local | Send burst calls (> 2 req / 10s) and observe quota rejection |
| **12** | Demonstrate Bulkhead Concurrency Isolation | Week 3 | Live & Local | Execute concurrent requests; observe available slots drop from 1.0 to 0.0 |
| **13** | Demonstrate Latency & TimeLimiter Timeout | Week 4 | Live & Local | Click **Trigger Latency** (`?delay=3000`); verify 2s timeout & fallback |
| **14** | Demonstrate Micrometer Tracing Context | Week 4 | Local Demo Only | Inspect trace header injection (`traceparent` / `X-B3-TraceId`) |
| **15** | Open Zipkin UI & Inspect Waterfall Spans | Week 4 | Local Demo Only | Open `http://localhost:9411` and query multi-span trace tree |
| **16** | Final Project Status & Submission Wrap-Up | Final | Live & Local | Summarize verified 22 QA test cases and 100% pass rate |

---

## Environment & Scope Classification

To maintain 100% credibility during evaluations, demonstration steps are categorized by accessibility:

1. **`IMPLEMENTED + DEMONSTRABLE (LIVE & LOCAL)`**:
   - Live URL: [https://circuit-breaker-one.vercel.app/](https://circuit-breaker-one.vercel.app/)
   - Demonstrable steps: Steps 1 through 13, and Step 16.
2. **`IMPLEMENTED + LOCAL DEMO ONLY`**:
   - Requires local backend stack or tunnel agent running.
   - Demonstrable steps: Step 14 (Trace Context Headers) and Step 15 (Zipkin Dashboard at `http://localhost:9411`).

---

## Detailed Step-by-Step Walkthrough

### Step 1: Open Application & Environment Check
- **Action**: Open browser and navigate to [https://circuit-breaker-one.vercel.app/](https://circuit-breaker-one.vercel.app/) (or `http://localhost:5173`).
- **Script**: *"We begin our 4-week final review demo by loading the CircuitBreaker React monitoring dashboard."*

### Step 2: Architecture & System Status Overview
- **Action**: Highlight Service Status Cards at the top of the UI.
- **Script**: *"The dashboard displays live health indicators for all registered services: Service Registry on port 8080, API Gateway on port 8084, Product Service on 8081, Inventory Service on 8082, and Recommendation Service on 8083."*

### Step 3: Product Service Demonstration
- **Action**: Call Product Service endpoint `/product-service/products`.
- **Script**: *"Week 1 requirement: Product Service returns catalog JSON containing items like Laptops and Smartphones."*

### Step 4: Inventory Service Demonstration
- **Action**: Call Inventory Service endpoint `/inventory-service/inventory/1`.
- **Script**: *"Inventory Service returns stock status: `{"productId":"1","inStock":true,"quantity":100}`."*

### Step 5: Recommendation Service Demonstration
- **Action**: Call Recommendation Service endpoint `/recommendation-service/recommendations/1`.
- **Script**: *"Recommendation Service returns cross-sell items: `["Accessories", "Extended Warranty"]`."*

### Step 6: API Gateway Ingress Routing
- **Action**: Show how all requests route through port `8084` without hardcoding microservice IPs.
- **Script**: *"Spring Cloud Gateway acts as our single entry point, dynamically rewriting path prefixes to route traffic."*

### Step 7: Eureka Service Discovery
- **Action**: View Eureka registry response.
- **Script**: *"Eureka maintains instance heartbeats, allowing services to scale dynamically."*

### Step 8: Trigger Chaos Service Failure
- **Action**: Click the red **Trigger Failure** button (`?fail=true`).
- **Script**: *"Week 2 requirement: We inject an artificial exception into the Recommendation Service."*

### Step 9: Circuit Breaker State Transition
- **Action**: Observe the Circuit Breaker Card update.
- **Script**: *"When failure rate exceeds 50%, Resilience4j transitions state from CLOSED to OPEN for 5 seconds, short-circuiting calls."*

### Step 10: Graceful Fallback Execution
- **Action**: Inspect response payload: `HTTP 200 OK`, `["No recommendations available at this time (Fallback)"]`.
- **Script**: *"The client application receives a clean fallback response with HTTP 200 OK instead of a broken 500 error."*

### Step 11: Rate Limiting Demonstration
- **Action**: Send burst requests (> 2 calls in 10s).
- **Script**: *"Week 3 requirement: Rate Limiter enforces a 2-request per 10-second quota, rejecting excess calls."*

### Step 12: Bulkhead Concurrency Isolation
- **Action**: Execute concurrent requests and observe available slots drop from 1.0 to 0.0.
- **Script**: *"Bulkhead limits concurrent executions to 1 active call, isolating CPU and memory resources."*

### Step 13: Latency & TimeLimiter Timeout
- **Action**: Click **Trigger Latency** (`?delay=3000`).
- **Script**: *"Week 4 requirement: A 3-second delay triggers Resilience4j's 2-second TimeLimiter timeout, returning fallback after retry cycles."*

### Step 14: Micrometer Distributed Tracing Context
- **Action**: Inspect trace context headers (`traceparent` / `X-B3-TraceId`).
- **Script**: *"Micrometer Tracing injects unified trace IDs across network hops."*

### Step 15: Open Zipkin UI & Inspect Waterfall Spans
- **Action**: Open Zipkin UI (`http://localhost:9411`).
- **Script**: *"In Zipkin, we inspect the exact waterfall breakdown across 3 distinct spans: Gateway ingress, client proxy, and microservice execution."*

### Step 16: Final Project Summary & Wrap-Up
- **Action**: Review verified QA test matrix (22 tests, 100% PASS).
- **Script**: *"In summary, the CircuitBreaker platform fulfills all Week 1 through Week 4 milestone requirements and is fully verified across 22 test cases."*

---
*Guide compiled and verified strictly against project source code, QA documentation, and deployment endpoints.*
