# CircuitBreaker â€” Professional 5â€“10 Minute Demonstration Script

This document provides a step-by-step presentation and live demo script for showcasing the **CircuitBreaker** cloud-native resilience and distributed tracing platform during technical interviews, portfolio walkthroughs, or stakeholder reviews.

---

## Presentation Outline

| Step | Topic | Target Duration | Key Visual / Action |
|:---:|:---|:---:|:---|
| **1** | Elevator Pitch & Problem Statement | 45 seconds | Dashboard Header & Architecture Overview |
| **2** | Microservice Topology & Discovery | 1 minute | Service Status Cards (Eureka, Gateway, Microservices) |
| **3** | Happy Path: Normal Request Flow | 1 minute | Click **Normal Request** & inspect JSON output |
| **4** | Chaos Test 1: Controlled Failure & Fallback | 1.5 minutes | Click **Trigger Failure** & observe graceful degradation |
| **5** | Chaos Test 2: Latency Simulation & TimeLimiter | 1.5 minutes | Click **Trigger Latency** & observe timeout / ~8s duration |
| **6** | Concurrency Isolation: Bulkhead Pattern | 1 minute | Concurrency metrics & Bulkhead slot saturation |
| **7** | Distributed Tracing in Zipkin | 1.5 minutes | Click **Open Zipkin** & inspect multi-span trace hierarchy |
| **8** | Real-Time Metrics & Observability | 1 minute | Resilience4j Metrics Card (Failure Rate, Call Counts) |
| **9** | Conclusion & Key Takeaways | 45 seconds | Closing statement on architectural robustness |

---

## 1. Introduction (30â€“45 Seconds)

> *"Hello everyone. Today I am presenting **CircuitBreaker**, a cloud-native microservices platform built with **Spring Boot 3**, **Spring Cloud Gateway**, **Netflix Eureka**, and **Resilience4j**, paired with a modern **React monitoring dashboard** and **Zipkin distributed tracing**.*
>
> *In distributed architectures, inter-service network calls can fail, experience sudden latency spikes, or exhaust thread pools, leading to cascading system-wide outages. This project demonstrates how we can implement six core resilience patternsâ€”**Circuit Breaker, Fallback, Retry, TimeLimiter, RateLimiter, and Bulkhead**â€”to build a self-healing system that guarantees high availability and graceful degradation even under severe chaos conditions."*

---

## 2. Architecture & Service Topology (1 Minute)

*(Point to the **System Overview** section at the top of the React Dashboard)*

> *"Here on the dashboard, we have real-time visibility into all backend components:*
> 1. *Our **Eureka Service Registry** running on port `8080`, providing dynamic instance discovery.*
> 2. *Our **Spring Cloud API Gateway** on port `8084`, acting as the single ingress point using non-blocking reactive routing.*
> 3. *Our core domain microservices: **Product Service** (`:8081`) and **Inventory Service** (`:8082`).*
> 4. *Our **Recommendation Service** on port `8083`, which acts as the resilience testbed.*
> 5. *Our **Zipkin Distributed Tracing Server** on port `9411`.*
>
> *All requests initiated by the user flow through the API Gateway, which dynamically locates the appropriate service using Eureka and passes distributed trace context headers throughout the entire execution lifecycle."*

---

## 3. Normal Request Flow (1 Minute)

*(Scroll down to the **Chaos Controls** section and click **Normal Request**)*

> *"Let's test the baseline happy path. I'll click **Normal Request**."*
>
> - **Action**: Click the blue `Normal Request` button.
> - **What happens**:
>   - Request sent: `GET http://localhost:8084/recommendation-service/recommendations/1`
>   - Response time: ~10â€“25 ms.
>   - Status: `HTTP 200 OK`.
>   - Response Payload:
>     ```json
>     {
>       "productId": "1",
>       "recommendations": ["Accessories", "Extended Warranty"]
>     }
>     ```
> - **Trace Summary Box**:
>   - Shows `Trace ID`, `Duration: ~15ms`, and Services: `api-gateway â†’ recommendation-service`.
>
> *"As we can see, the request passes cleanly through the Gateway to the Recommendation Service, all resilience checks pass, and valid product recommendations are returned immediately."*

---

## 4. Chaos Test 1: Controlled Failure & Fallback (1.5 Minutes)

*(Click **Trigger Failure**)*

> *"Now let's inject a sudden downstream failure. When I click **Trigger Failure**, the request attaches `?fail=true`, causing the Recommendation Service to throw a runtime exception."*
>
> - **Action**: Click the red `Trigger Failure` button.
> - **What happens**:
>   - The Recommendation Service throws an internal `RuntimeException`.
>   - Resilience4j's **Retry** aspect attempts 3 retries (1s interval).
>   - When retries fail, the **Circuit Breaker** catches the exception and immediately invokes the **Fallback method**.
>   - Response: `HTTP 200 OK`.
>   - Response Payload:
>     ```json
>     {
>       "productId": "1",
>       "recommendations": ["No recommendations available at this time (Fallback)"]
>     }
>     ```
>   - The UI displays an amber badge: `âš ï¸ Fallback activated`.
>
> *"Notice that even though the backend service experienced an internal error, the client never received a `500 Internal Server Error`. Instead, the system degraded gracefully, returning a sanitized fallback response within ~2.05 seconds while recording the failure in our metrics."*

---

## 5. Chaos Test 2: Latency Simulation & TimeLimiter (1.5 Minutes)

*(Click **Trigger Latency**)*

> *"Next, let's simulate severe network latency or downstream database lock by triggering a 3-second delay on an endpoint configured with a 2-second TimeLimiter."*
>
> - **Action**: Click the amber `Trigger Latency` button.
> - **What happens**:
>   - Request sent: `GET /recommendation-service/recommendations/1?delay=3000`.
>   - The service enters an asynchronous sleep.
>   - At exactly **2.0 seconds**, Resilience4j's **TimeLimiter** fires a `TimeoutException` and cancels the thread.
>   - The **Retry** mechanism attempts the call again, timing out each time.
>   - Total request duration finishes at approximately **8.05 seconds**.
>   - Graceful fallback is returned with `HTTP 200 OK`.
>
> *"This proves that our system protects thread pools from unbounded blocking. Even under extreme latency, the TimeLimiter and Retry mechanisms enforce execution boundaries and fall back safely."*

---

## 6. Concurrency Isolation: Bulkhead Pattern (1 Minute)

*(Point to the **Resilience4j Metrics Card**)*

> *"In addition to timeouts, we implemented a **Bulkhead pattern** configured with `maxConcurrentCalls = 1`.*
>
> *When two long-running requests arrive simultaneously, the first request occupies the single available execution slot (dropping available calls to `0`). The second concurrent request is immediately rejected by the Bulkhead with `BulkheadFullException` and redirected to the fallback method rather than queuing up and exhausting memory.*
>
> *Once the active request finishes, the Bulkhead instantly recovers back to `1.0` available concurrency slot, ensuring strict resource isolation."*

---

## 7. Distributed Tracing in Zipkin (1.5 Minutes)

*(Click the **Open Zipkin** button in the Tracing Card, opening `http://localhost:9411`)*

> *"Now let's examine end-to-end observability using Zipkin.*
>
> *When we open Zipkin and query recent traces for `api-gateway`, we see complete distributed traces for all our chaos actions.*
>
> *Let's look at the **Latency Trace** (Duration: `8.093s`):*
> - *Span 1: `api-gateway` (Server ingress â€” 8.093s)*
> - *Span 2: `api-gateway` (HTTP Client forwarding â€” 8.088s)*
> - *Span 3: `recommendation-service` (Controller execution â€” 8.085s)*
>
> *This single trace proves that distributed trace context was preserved across network boundaries through the Gateway all the way to the microservice, giving DevOps and engineering teams immediate root-cause visibility into where latency originated."*

---

## 8. Real-Time Metrics & Actuator (1 Minute)

*(Point to the **Circuit Breaker** and **Metrics** cards on the dashboard)*

> *"Our dashboard continuously polls Spring Boot Actuator endpoints every 3 seconds to reflect live metrics:*
> - *`resilience4j.circuitbreaker.state`: Reflects the current state (Closed / Open / Half-Open).*
> - *`resilience4j.circuitbreaker.calls`: Shows successful vs. failed call counts.*
> - *`resilience4j.ratelimiter.available.permissions`: Tracks our 2-request quota per 10-second period.*
> - *`resilience4j.bulkhead.available.concurrent.calls`: Tracks concurrent thread availability.*
>
> *Everything is dynamic, reactive, and driven directly by standard Micrometer metrics."*

---

## 9. Conclusion (45 Seconds)

> *"To summarize: **CircuitBreaker** demonstrates a resilient, observable microservices architecture where service discovery, non-blocking routing, multi-layered fault tolerance, and distributed tracing work in harmony.*
>
> *Whether handling service crashes, transient network drops, high concurrency, or latency spikes, the system guarantees that failures remain isolated and clients always receive responsive, predictable behavior.*
>
> *Thank you, and I welcome any technical questions!"*

---

## Frequently Asked Technical Interview Questions & Answers

### Q1: Why did you place the CircuitBreaker aspect before the Retry aspect?
**Answer**: *"The aspect order is critical. In Resilience4j, we configured `circuitBreakerAspectOrder = 1` and `retryAspectOrder = 4`. This ensures the CircuitBreaker sits on the outside. If the inner Retry fails after all 3 attempts, the final exception bubbles up to the CircuitBreaker, which counts it as a failure and routes execution to the `fallbackMethod` so the client receives a 200 fallback response."*

### Q2: Why does the latency test take ~8 seconds when the timeout is 2 seconds?
**Answer**: *"Because our Retry configuration is set to `maxAttempts = 3` with a `1s` wait duration. When the 3000ms delay runs, the 2-second TimeLimiter fires a `TimeoutException`. The Retry aspect catches this and retries twice more. 3 attempts Ã— ~2s timeout + 2 Ã— 1s retry wait durations equals approximately 8 seconds total before invoking the fallback."*

### Q3: How does Spring Cloud Gateway discover downstream services dynamically?
**Answer**: *"We enabled `spring.cloud.gateway.discovery.locator.enabled=true` and `lower-case-service-id=true`. The Gateway registers with Eureka as a client and listens to registry events. When a request matching `/{service-id}/**` arrives, Gateway resolves the registered instances from Eureka's local cache and load-balances the call without static route configs."*

### Q4: How is distributed tracing context propagated between the Gateway and services?
**Answer**: *"We use Micrometer Tracing with the Brave bridge (`micrometer-tracing-bridge-brave`) and Zipkin Reporter (`zipkin-reporter-brave`). When a request enters Spring Cloud Gateway, a `traceId` and root `spanId` are generated and injected as HTTP headers (such as `traceparent` or B3 headers `X-B3-TraceId`). The downstream Spring Boot service extracts these headers upon receiving the request, creates a child span, and reports it back to Zipkin."*
