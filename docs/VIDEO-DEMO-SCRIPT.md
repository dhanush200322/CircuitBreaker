# CircuitBreaker — Video Demonstration Script

> **Target Duration:** 3.5 – 4.5 Minutes  
> **Target Audience:** Technical Recruiters, Software Engineering Interviewers, and System Architects  
> **Live Demo URL:** [https://circuit-breaker-one.vercel.app/](https://circuit-breaker-one.vercel.app/)

---

## Recording Overview & Timeline

```
[0:00 - 0:20]  Section 1: Introduction & High-Level Overview
[0:20 - 0:50]  Section 2: System Architecture & Ingress Flow
[0:50 - 1:20]  Section 3: Live Production Dashboard Walkthrough
[1:20 - 1:50]  Section 4: Normal Request Flow & Discovery
[1:50 - 2:40]  Section 5: Chaos Fault Injection, Circuit Breaker & Fallback
[2:40 - 3:15]  Section 6: Latency Simulation & TimeLimiter Timeout
[3:15 - 3:50]  Section 7: OpenZipkin Distributed Tracing Inspection
[3:50 - 4:10]  Section 8: Eureka Service Registry Inspection
[4:10 - 4:30]  Section 9: Architecture Recap & Conclusion
```

---

## SECTION 1 — INTRO
**Duration:** `0:00 – 0:20` (20 seconds)  
**Screen View:** GitHub Repository homepage / Visual Studio Code editor / Project Header.

### Action:
- Start recording on the GitHub repository page or the project README.
- Speak in a clear, confident, natural tone.

### Spoken Script:
> "Hi everyone, this is my CircuitBreaker project. It is a cloud-native, fault-tolerant microservices platform built with Java 17 and Spring Boot 3. The system demonstrates enterprise resilience engineering using Spring Cloud Gateway, Netflix Eureka service discovery, Resilience4j, Spring Boot Actuator, and OpenZipkin distributed tracing, all connected to a live React monitoring dashboard."

---

## SECTION 2 — ARCHITECTURE
**Duration:** `0:20 – 0:50` (30 seconds)  
**Screen View:** System Architecture ASCII diagram in `README.md` or `docs/ARCHITECTURE.md`.

### Action:
- Scroll to the ASCII architecture diagram.
- Use your cursor to trace the request path from the browser through Vercel and Cloudflare to the backend.

### Spoken Script:
> "Let's take a quick look at the architecture. The frontend is deployed globally on Vercel. User requests are routed via secure Cloudflare Tunnels directly to our reactive Spring Cloud Gateway on port 8084.
> 
> The Gateway queries Eureka on port 8080 for dynamic service discovery and load balances requests to three business microservices: Product Service, Inventory Service, and Recommendation Service.
> 
> The Recommendation Service implements our Resilience4j fault-tolerance pipeline—including Circuit Breaker, Smart Retry, TimeLimiter, and Fallback handlers. Finally, all services emit distributed trace spans to an OpenZipkin server on port 9411."

---

## SECTION 3 — LIVE DASHBOARD
**Duration:** `0:50 – 1:20` (30 seconds)  
**Screen View:** Web Browser on `https://circuit-breaker-one.vercel.app/`

### Action:
- Switch to the live Vercel dashboard tab.
- Hover over the **SYSTEM HEALTHY** badge in the header.
- Highlight the **System Overview** cards (Eureka, API Gateway, Product, Inventory, Recommendation).
- Highlight the **Zipkin Tracing**, **Circuit Breaker**, and **Resilience Metrics** cards.

### Spoken Script:
> "Here is our live production dashboard running on Vercel. In the header, we can see the pulsing 'SYSTEM HEALTHY' status.
> 
> In the System Overview, all five core services—Eureka Registry, API Gateway, Product, Inventory, and Recommendation—show green 'UP' badges. These are real-time heartbeats fetched from the Eureka registry.
> 
> Down below, the Circuit Breaker is currently in the CLOSED state, Zipkin reports four active traced microservices, and our Resilience Metrics card streams live statistics directly from Spring Boot Actuator."

---

## SECTION 4 — NORMAL REQUEST
**Duration:** `1:20 – 1:50` (30 seconds)  
**Screen View:** Chaos Controls section on the Dashboard.

### Action:
- Click the **Normal Request** button (indigo).
- Wait ~1 second for the execution and Zipkin trace ingestion.
- Point out the `Status: 200`, the execution duration, the JSON payload (`Accessories`, `Extended Warranty`), and the newly generated **Trace Summary** (Trace ID and `api-gateway → recommendation-service` flow).

### Spoken Script:
> "Let's trigger a healthy baseline request. I'll click 'Normal Request'. 
> 
> The request travels from Vercel through the API Gateway to the Recommendation Service. We receive an HTTP 200 OK with the recommended accessories in under 20 milliseconds.
> 
> Notice that our dashboard immediately captured the Zipkin Trace ID, showing the exact two-hop distributed execution path."

---

## SECTION 5 — FAILURE / CIRCUIT BREAKER & FALLBACK
**Duration:** `1:50 – 2:40` (50 seconds)  
**Screen View:** Chaos Controls & Circuit Breaker / Metrics cards.

### Action:
- Click the **Trigger Failure** button (rose red).
- Point out the `⚠️ Fallback activated` banner and the degraded response payload: `"No recommendations available at this time (Fallback)"`.
- Scroll up to show the **Failed Calls** counter incrementing, the **Failure Rate** calculating dynamically (e.g. `20%` or `40%`), and the **Retries** metric incrementing.

### Spoken Script:
> "Now, let's simulate a downstream service failure using chaos injection. I'll click 'Trigger Failure'.
> 
> Instead of crashing or returning an unhandled HTTP 500 error to the customer, Resilience4j intercepts the exception. It executes our configured retry logic, catches the failure, and seamlessly routes to the fallback method, returning a valid HTTP 200 degraded response.
> 
> Looking at the dashboard metrics, our Failed Calls and Retry counters have updated in real time, and the Circuit Breaker's failure rate threshold is actively calculated."

---

## SECTION 6 — LATENCY / TIMEOUT HANDLING
**Duration:** `2:40 – 3:15` (35 seconds)  
**Screen View:** Chaos Controls & Resilience Metrics.

### Action:
- Click the **Trigger Latency** button (amber).
- Observe the loading state for ~2 seconds.
- Show the `⚠️ Fallback activated` banner and point out the duration (~8000ms after timeout and retries).
- Show the **Timeouts** counter in the Resilience Metrics card incrementing.

### Spoken Script:
> "Next, let's simulate severe network latency. A slow downstream service is often more dangerous than a dead one because it exhausts server thread pools. I'll click 'Trigger Latency', injecting a 3-second delay.
> 
> Our Resilience4j TimeLimiter has a strict 2-second timeout window. When the execution exceeds two seconds, the TimeLimiter cancels the running thread future and triggers the fallback. The dashboard records the timeout event and protects our gateway from thread starvation."

---

## SECTION 7 — ZIPKIN DISTRIBUTED TRACING
**Duration:** `3:15 – 3:50` (35 seconds)  
**Screen View:** OpenZipkin UI in a new browser tab.

### Action:
- Scroll up to the **Zipkin Tracing** card and click the **Open Zipkin** button.
- In the Zipkin web UI, click **Run Query** to search recent traces.
- Click into the latest trace to expand the span waterfall breakdown showing `api-gateway` and `recommendation-service`.
- Highlight span duration, HTTP tags, and span IDs.

### Spoken Script:
> "Let's inspect the distributed traces in Zipkin by clicking 'Open Zipkin'.
> 
> In the Zipkin console, we can see every hop across our microservices architecture. Here is the parent span generated by Spring Cloud Gateway, and nested inside is the child span from Recommendation Service.
> 
> We can view the exact HTTP method, route ID, response code, and latency breakdown down to the millisecond. This gives operators complete observability across microservice boundaries."

---

## SECTION 8 — EUREKA SERVICE REGISTRY
**Duration:** `3:50 – 4:10` (20 seconds)  
**Screen View:** Dashboard System Overview / Eureka XML/JSON API response.

### Action:
- Switch back to the dashboard.
- Hover over the 5 service status cards showing green `UP` indicators.

### Spoken Script:
> "All service routing is driven dynamically by Netflix Eureka. The API Gateway doesn't have hardcoded IP addresses; it discovers instances using client-side load balancing. If any service instance goes down or scales horizontally, Eureka updates the registry and the Gateway adjusts routing automatically."

---

## SECTION 9 — FINAL SUMMARY & CLOSING
**Duration:** `4:10 – 4:30` (20 seconds)  
**Screen View:** Live Dashboard with all metrics and controls visible.

### Action:
- Frame the full dashboard on screen.
- Deliver closing statement with enthusiasm.

### Spoken Script:
> "To summarize: this project demonstrates an end-to-end cloud-native microservices architecture featuring dynamic service discovery, reactive API gateway routing, Resilience4j fault tolerance, real-time Actuator metrics, distributed tracing with OpenZipkin, and a live React monitoring dashboard.
> 
> Thank you for watching!"
