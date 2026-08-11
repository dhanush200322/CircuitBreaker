# CircuitBreaker â€” Engineering Interview & Viva Preparation Guide

This guide contains practical, real-world questions and conversational answers covering all aspects of the **CircuitBreaker** platformâ€”including Spring Boot 3, Spring Cloud Gateway, Eureka, Resilience4j, Zipkin, React, System Design, and Troubleshooting.

---

## Table of Contents
1. [Project Overview & Behavioral Questions (10 Questions)](#1-project-overview--behavioral-questions)
2. [Core Java & Spring Boot 3 Technical Questions (20 Questions)](#2-core-java--spring-boot-3-technical-questions)
3. [System Architecture & Microservices Questions (10 Questions)](#3-system-architecture--microservices-questions)
4. [Production Troubleshooting & Debugging Scenarios (10 Questions)](#4-production-troubleshooting--debugging-scenarios)

---

## 1. Project Overview & Behavioral Questions

### Q1: Can you give me an elevator pitch of your CircuitBreaker project?
**Answer**: *"Sure! CircuitBreaker is a cloud-native microservices platform built on Spring Boot 3, Spring Cloud Gateway, Netflix Eureka, and Resilience4j. The goal was to build a self-healing e-commerce backend where downstream latency spikes, transient failures, or thread starvation never cause cascading outages. We implemented six core resilience patternsâ€”Circuit Breaker, Fallback, Retry, TimeLimiter, RateLimiter, and Bulkheadâ€”and wired up Micrometer Tracing and Zipkin for end-to-end distributed tracing. To make it interactive, I built a real-time React monitoring dashboard with chaos engineering controls where you can inject failures or delays and immediately watch the system recover and inspect the resulting traces."*

### Q2: What motivated you to build this project?
**Answer**: *"In modern distributed systems, services fail all the timeâ€”networks drop packets, databases lock up, and third-party APIs slow down. If services make synchronous calls without protection, one slow dependency can consume all available threads in upstream services and bring down the entire company's platform. I wanted to build a hands-on, production-grade testbed to master how Spring Cloud Gateway, Eureka, Resilience4j, and Zipkin work together to solve this exact problem."*

### Q3: What were the most challenging engineering problems you solved here?
**Answer**: *"Two things stood out. First was configuring the Resilience4j aspect order. When you stack annotations like `@CircuitBreaker`, `@RateLimiter`, `@Bulkhead`, `@Retry`, and `@TimeLimiter` on a single method, their execution order determines whether failures are retried before tripping the circuit breaker or whether timeouts are handled gracefully. Getting the aspect order configured so the CircuitBreaker was outermost and caught exhausted retries and timeouts for fallback was crucial.*

*The second challenge was distributed trace context propagation across a reactive Spring Cloud Gateway (built on WebFlux/Netty) down to standard servlet-based Spring Boot microservices. We had to ensure Brave and Micrometer Tracing properly injected and extracted B3/W3C trace headers across network boundaries."*

### Q4: Why did you choose Resilience4j over Netflix Hystrix?
**Answer**: *"Netflix deprecated Hystrix several years ago in maintenance mode. Resilience4j is designed specifically for Java 8+ and functional programming. It's lightweight because it uses Vavr and doesn't force every request into a separate thread pool like Hystrix did. It supports decorators and Spring Boot 3 AOP seamlessly, letting you combine Circuit Breakers, Bulkheads, and Rate Limiters with negligible memory overhead."*

### Q5: If you had another month to work on this, what would you add next?
**Answer**: *"I would add a persistent database layer with Spring Data JPA and PostgreSQL, integrate Apache Kafka for asynchronous event-driven messaging, implement OAuth2/OIDC JWT security at the API Gateway using Spring Security and Keycloak, and package the entire multi-service stack with Kubernetes Helm charts."*

### Q6: How did you test and validate that your resilience patterns actually worked?
**Answer**: *"I built dedicated chaos endpoints right into the controller using query flags like `?fail=true` to simulate server crashes and `?delay=3000` to simulate latency. Then, in addition to automated PowerShell test scripts measuring request times and polling Actuator metrics, I built an interactive React dashboard where clicking chaos buttons immediately executes the calls, shows the fallback badges, and queries Zipkin to prove the trace was recorded."*

### Q7: How did you ensure the frontend dashboard stayed responsive?
**Answer**: *"The React dashboard runs a lightweight 3-second polling interval using standard `fetch` against Vite proxy routes. We wrote custom TypeScript API handlers with safe fallback structures so that if any individual service or even Zipkin itself goes offline, the dashboard gracefully marks that specific card as 'DOWN' or 'Offline' without crashing the entire UI."*

### Q8: What was your strategy for API Gateway routing?
**Answer**: *"Rather than hardcoding static IP addresses or route definitions in `application.properties`, we enabled Spring Cloud Gateway's discovery locator (`spring.cloud.gateway.discovery.locator.enabled=true`). The Gateway acts as a Eureka client and dynamically resolves routes based on the service name in the URL path (e.g. `/recommendation-service/**`). This makes adding new microservices zero-config from the gateway perspective."*

### Q9: How did you manage dependencies across 5 microservices?
**Answer**: *"We structured the backend as an Apache Maven multi-module parent project. The root `pom.xml` manages the Spring Boot parent (`3.2.5`), Java version (`17`), and imports the Spring Cloud BOM (`2023.0.1`) in `<dependencyManagement>`. Each child submodule inherits versions cleanly without version mismatches."*

### Q10: How would you explain this project to a non-technical stakeholder?
**Answer**: *"Think of our e-commerce platform like a modern electrical grid. In an old system, if one house has a short circuit, the entire neighborhood loses power. With our platform, we installed smart 'circuit breakers' and emergency backup generators. If our recommendation engine gets overloaded or crashes, our smart breakers instantly isolate the problem in milliseconds and provide default recommendations so customers can continue shopping without ever noticing an error."*

---

## 2. Core Java & Spring Boot 3 Technical Questions

### Q11: What is a Circuit Breaker, and what are its three states?
**Answer**: *"A Circuit Breaker is a stability pattern that monitors for failures. It has three states:
1. **CLOSED**: Normal operation. Requests flow to the downstream service. If the failure rate across the sliding window exceeds the threshold (e.g., 50%), it trips to **OPEN**.
2. **OPEN**: Fast-fail state. Requests are immediately blocked from hitting the downstream service and redirected to the fallback method. After a configured wait duration (e.g., 5 seconds), it transitions to **HALF_OPEN**.
3. **HALF_OPEN**: Trial state. A limited number of test calls (e.g., 3 calls) are permitted through. If they succeed, the circuit resets to **CLOSED**; if any fail, it trips back to **OPEN**."*

### Q12: How does Resilience4j calculate the failure rate?
**Answer**: *"Resilience4j uses a sliding windowâ€”either count-based or time-based. In our project, we configured a count-based sliding window of size `5` (`slidingWindowSize=5`) and a failure rate threshold of `50%`. Once at least 5 calls are recorded, if 3 or more fail (60% > 50%), the circuit opens."*

### Q13: What is the purpose of the Bulkhead pattern, and how did you configure it?
**Answer**: *"The Bulkhead pattern isolates resources so that a failure in one area doesn't exhaust the whole system (named after the watertight compartments in a ship). In Resilience4j, we configured a semaphore-based bulkhead with `maxConcurrentCalls = 1` and `maxWaitDuration = 0`. This limits concurrent executions on the recommendation service to exactly 1. If a second concurrent call arrives while the first is running, it's immediately rejected with a `BulkheadFullException` and redirected to fallback."*

### Q14: What is the RateLimiter pattern, and how does it differ from a Bulkhead?
**Answer**: *"A **RateLimiter** limits the total number of calls allowed over a given *time window* (e.g., 2 requests per 10 seconds), regardless of concurrency. A **Bulkhead** limits the number of *simultaneously active executions* occurring at the exact same millisecond. We use RateLimiter to defend against burst traffic and Bulkhead to protect against thread pool starvation."*

### Q15: Why must methods using `@TimeLimiter` return a `CompletableFuture`?
**Answer**: *"Because `@TimeLimiter` enforces asynchronous execution boundaries. To cancel a running task when a timeout threshold (e.g., 2 seconds) expires, the underlying operation must be wrapped in a non-blocking asynchronous future (like `CompletableFuture.supplyAsync(...)`). When the timeout occurs, Resilience4j cancels the future with a `TimeoutException`."*

### Q16: What is the exact aspect order you configured, and why does it matter?
**Answer**: *"We configured the aspect order in `application.properties`:
- `circuitBreakerAspectOrder = 1` (Outermost)
- `rateLimiterAspectOrder = 2`
- `bulkheadAspectOrder = 3`
- `retryAspectOrder = 4`
- `timeLimiterAspectOrder = 5` (Innermost)

This ensures that when a call is made, RateLimiter and Bulkhead check permissions first, then Retry attempts the call, and TimeLimiter enforces the 2s timeout. If retries fail or timeout occurs, the exception bubbles up to the CircuitBreaker aspect on the outside, which records the failure and invokes the `fallbackMethod` to return an HTTP 200 fallback."*

### Q17: What are the signature requirements for a Resilience4j fallback method?
**Answer**: *"The fallback method must:
1. Reside in the same class (or a referenced bean).
2. Have the exact same return type as the original method.
3. Accept the exact same method arguments as the original method.
4. Have an extra trailing parameter of type `Throwable` (or a specific exception class like `TimeoutException`)."*

### Q18: What is the difference between Micrometer Tracing and Brave?
**Answer**: *"**Micrometer Tracing** is an abstraction facade (similar to SLF4J for logging) introduced in Spring Boot 3 to replace Spring Cloud Sleuth. **Brave** is the actual tracing engine/tracer implementation that creates spans, tracks IDs, and manages contexts. `zipkin-reporter-brave` is the reporter library that serializes and sends those spans to Zipkin."*

### Q19: What is W3C traceparent / B3 propagation?
**Answer**: *"They are HTTP header standards for distributed tracing. B3 uses headers like `X-B3-TraceId` and `X-B3-SpanId`, while W3C uses a single `traceparent` header (format: `00-{traceId}-{spanId}-{flags}`). When the API Gateway receives a request, it injects these headers into the downstream HTTP call so that all microservices associate their logs and spans with the exact same global transaction ID."*

### Q20: Why did you set `management.tracing.sampling.probability=1.0`?
**Answer**: *"In production, high-volume systems might sample 1% or 10% of requests to reduce network and storage overhead. In our demonstration and local QA environment, we set sampling to `1.0` (100%) so that every single request generated through the chaos controls or curl creates a visible trace in Zipkin."*

### Q21: What is Spring Cloud Gateway's threading model compared to traditional Spring MVC?
**Answer**: *"Spring Cloud Gateway is built on Spring WebFlux, Project Reactor, and Netty. It uses a non-blocking, event-driven reactive threading model (event loops with a small number of worker threads). Traditional Spring MVC uses a thread-per-request model (Tomcat). This makes Spring Cloud Gateway capable of handling thousands of concurrent connections with low memory footprint."*

### Q22: What is the role of Eureka heartbeats and lease renewals?
**Answer**: *"When an instance registers with Eureka, Eureka creates a lease. The client sends a heartbeat every 30 seconds by default. If Eureka does not receive a heartbeat for 90 seconds, it assumes the instance died and evicts it from the active registry so the Gateway stops routing traffic to it."*

### Q23: What does `@EnableDiscoveryClient` do in Spring Boot?
**Answer**: *"It activates the Spring Cloud discovery client configuration, allowing the microservice to register with the Eureka server specified in `eureka.client.service-url.defaultZone` and publish its hostname, IP, and health endpoint."*

### Q24: How does Spring Boot Actuator expose metrics to external tools?
**Answer**: *"Spring Boot Actuator integrates with Micrometer. By including `spring-boot-starter-actuator` and configuring `management.endpoints.web.exposure.include=health,metrics`, it automatically exposes HTTP endpoints at `/actuator/health` and `/actuator/metrics/{metric.name}` where metrics can be scraped or polled."*

### Q25: What is the difference between synchronous and asynchronous circuit breakers?
**Answer**: *"Synchronous circuit breakers block the calling thread during execution and catch runtime exceptions directly. Asynchronous circuit breakers wrap non-blocking types (like `CompletableFuture` or `Mono`/`Flux`) and attach completion/failure callbacks to handle timeouts and asynchronous exceptions without blocking the calling thread."*

### Q26: How does the React Vite proxy prevent CORS issues during local development?
**Answer**: *"In local development, the browser running on `localhost:5173` making requests to `localhost:8084` would normally trigger browser CORS security blocks. In `vite.config.ts`, we set up proxy rules for `/gateway`, `/actuator`, `/eureka-api`, and `/zipkin`. The browser makes same-origin requests to `localhost:5173`, and the Vite Node.js dev server proxies the HTTP calls on the backend where CORS rules do not apply."*

### Q27: How does the React UI find the latest Zipkin trace for a specific chaos request?
**Answer**: *"When a user clicks a chaos button, we record `requestStartTime = Date.now()`. After receiving the HTTP response, we query `/zipkin/api/v2/traces?serviceName=api-gateway&limit=10`. We parse each trace's root span timestamp and match the trace whose timestamp is closest to our `requestStartTime` (within a 5-second window). This ensures we show the exact trace for that specific button click."*

### Q28: What is the purpose of `@RequestParam(defaultValue = "0") int delay` in your controller?
**Answer**: *"It's a chaos injection hook. If `delay > 0`, the controller asynchronously calls `Thread.sleep(delay)`. This allows us to simulate realistic network latency or slow database queries on demand to prove our TimeLimiter and timeout mechanisms work."*

### Q29: What happens if Eureka goes down while services are running?
**Answer**: *"Spring Cloud Gateway and microservices cache the registry locally in memory. If Eureka crashes, existing services can continue communicating using their cached registry data for a period of time. However, new instances cannot register, and dead instances will not be evicted."*

### Q30: What is the difference between `CompletableFuture.supplyAsync()` and `CompletableFuture.completedFuture()`?
**Answer**: *"`.supplyAsync()` runs a lambda asynchronously on a fork-join worker pool thread and returns a future that completes when the task finishes. `.completedFuture()` immediately returns an already-resolved future containing the provided valueâ€”which is what our fallback method uses to return instant fallback responses without spawning unnecessary threads."*

---

## 3. System Architecture & Microservices Questions

### Q31: How would you scale the Recommendation Service horizontally?
**Answer**: *"You would start multiple instances of `recommendation-service` on different ports (or in separate Docker containers with ephemeral ports `server.port=0`). Each instance registers with Eureka under the same name `RECOMMENDATION-SERVICE`. Spring Cloud Gateway's built-in Spring Cloud LoadBalancer automatically load-balances requests across all available healthy instances using Round-Robin."*

### Q32: Where should Circuit Breakers live in a microservices architecture?
**Answer**: *"Circuit Breakers should live on the **caller side** (the client making the remote network call) or at the **API Gateway edge**. In our project, we also placed resilience decorators on the Recommendation Service controller to defend against internal resource exhaustion and third-party call latency."*

### Q33: How would you migrate this architecture to Kubernetes?
**Answer**: *"In Kubernetes:
1. We could replace Eureka with native **Kubernetes Services and DNS** (or keep Eureka for multi-cluster).
2. Spring Cloud Gateway would sit behind a Kubernetes Ingress controller.
3. Microservices would run as Deployments with Horizontal Pod Autoscaling (HPA) and Liveness/Readiness probes hitting `/actuator/health`.
4. Zipkin could run as a StatefulSet or ship traces to Jaeger/OpenTelemetry Collector."*

### Q34: What is the difference between API Gateway pattern and Service Mesh?
**Answer**: *"An **API Gateway** manages north-south traffic (ingress from external clients into the cluster, authentication, public routing). A **Service Mesh** (like Istio or Linkerd) manages east-west traffic (service-to-service communication within the cluster using sidecar proxies for mTLS, retries, and circuit breaking at the infrastructure layer)."*

### Q35: How does this design prevent cascading failures?
**Answer**: *"By combining TimeLimiter (to stop slow calls from holding threads), Bulkhead (to cap maximum concurrency), Circuit Breaker (to fail fast when a service is broken), and Fallbacks (to return cached or default data). If a downstream dependency fails, the failure is caught and contained within that single microservice boundary."*

---

## 4. Production Troubleshooting & Debugging Scenarios

### Q36: Scenario: The Gateway returns `503 Service Unavailable`. How do you diagnose it?
**Answer**: *"1. Check if the target service is registered in Eureka by visiting `http://localhost:8080/eureka/apps`.
2. If it's missing, check the target microservice logs for startup errors or Eureka connection failures.
3. If it is in Eureka, check if the service name in the Gateway URL matches the registered Eureka application name (case sensitivity)."*

### Q37: Scenario: A microservice is slow, but no errors are thrown. How do you find the bottleneck?
**Answer**: *"Open the Zipkin UI at `http://localhost:9411`, search for traces with high duration (e.g. `minDuration=2s`), and open the trace breakdown. Zipkin visualizes each span as a timeline bar. You can immediately see which exact microservice or child span consumed the majority of the total request time."*

### Q38: Scenario: The Circuit Breaker is not tripping to OPEN even though requests are failing. Why?
**Answer**: *"Check the sliding window settings:
1. Has the total number of calls reached the `slidingWindowSize` (5 calls)?
2. Has the failure rate reached the `failureRateThreshold` (50%)?
3. Is the exception thrown actually counted as a failure, or is it in `ignoreExceptions`?"*

### Q39: Scenario: The fallback method is throwing `NoSuchMethodException` on startup. What's wrong?
**Answer**: *"The fallback method signature does not match the controller method. It must have the identical return type and parameter list, plus a final `Throwable` parameter."*

### Q40: Scenario: Zipkin shows no traces for a service. What do you check?
**Answer**: *"1. Check if `micrometer-tracing-bridge-brave` and `zipkin-reporter-brave` dependencies are present in `pom.xml`.
2. Check `application.properties` for `management.tracing.sampling.probability=1.0` and `management.zipkin.tracing.endpoint=http://localhost:9411/api/v2/spans`.
3. Verify the Zipkin server is actively running on port 9411."*
