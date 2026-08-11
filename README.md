# CircuitBreaker Resilience Architecture

## Project Overview
This project demonstrates a robust microservices architecture leveraging Resilience4j and Spring Cloud. It showcases advanced resilience patterns (Circuit Breaker, Fallback, Retry, TimeLimiter, RateLimiter, and Bulkhead) applied to a backend ecosystem to ensure fault tolerance, graceful degradation, and system stability.

## Architecture Overview
The system relies on an Edge Gateway handling inbound client requests and routing them dynamically via a Service Registry. Backend microservices communicate and serve domain-specific data, heavily protected by Resilience4j patterns to prevent cascading failures.

## Technology Stack
- Java 17
- Spring Boot 3.2.5
- Spring Cloud (Gateway, Netflix Eureka, LoadBalancer)
- Resilience4j (CircuitBreaker, Retry, TimeLimiter, RateLimiter, Bulkhead)
- Maven

## Microservices
- **Eureka Server** — Port 8080 (Service Registry)
- **Product Service** — Port 8081 (Domain Service)
- **Inventory Service** — Port 8082 (Domain Service)
- **Recommendation Service** — Port 8083 (Domain Service / Resilience Testbed)
- **API Gateway** — Port 8084 (Edge Router / Load Balancer)

## Request Flow
Client → API Gateway → Eureka Service Discovery → Target Microservice → Resilience4j Protection → Response/Fallback

## Resilience Patterns
The `Recommendation Service` serves as the primary testbed for resilience implementation. 

### Circuit Breaker
- **Purpose**: Prevents the system from repeatedly executing a failing operation.
- **Configuration**: Opens when 50% of the last 5 calls fail.
- **Demonstrated**: By forcing failures (`?fail=true`), tracking the failure rate via Actuator metrics.
- **Expected Behavior**: Once the threshold is breached, the circuit opens, immediately rejecting calls without executing the core logic until the half-open wait duration expires.

### Fallback
- **Purpose**: Provides a graceful degradation mechanism when an operation fails or is rejected.
- **Configuration**: Bound to the CircuitBreaker aspect.
- **Demonstrated**: When the CircuitBreaker, RateLimiter, or Bulkhead rejects a request, or when a TimeLimiter/Retry exhausted exception occurs.
- **Expected Behavior**: Returns `["No recommendations available at this time (Fallback)"]`.

### Retry
- **Purpose**: Automatically retries transient failures.
- **Configuration**: 3 max attempts with a 1-second wait duration between retries.
- **Demonstrated**: By delaying a request. The Timeout triggers an exception, and Retry attempts it 3 times.
- **Expected Behavior**: A request taking longer than the timeout is retried multiple times before ultimately delegating to the fallback.

### TimeLimiter
- **Purpose**: Protects against slow downstream dependencies holding up threads.
- **Configuration**: 2-second timeout duration.
- **Demonstrated**: By passing `?delay=3000` to force the method to take 3 seconds.
- **Expected Behavior**: The request times out at 2 seconds and throws an exception, intercepted by Retry/CircuitBreaker.

### RateLimiter
- **Purpose**: Protects the system against traffic spikes by limiting the rate of incoming requests.
- **Configuration**: 2 requests allowed per 10 seconds.
- **Demonstrated**: Sending 3+ rapid requests.
- **Expected Behavior**: The first two succeed, the third is immediately rejected (`RequestNotPermitted`) and falls back.

### Bulkhead
- **Purpose**: Restricts concurrent execution capacity to prevent a single component from consuming all resources.
- **Configuration**: Maximum of 1 concurrent call allowed.
- **Demonstrated**: Executing two requests concurrently with artificial delays.
- **Expected Behavior**: One request processes, the second instantly receives a `BulkheadFullException` and falls back.

## Configuration Values

### Circuit Breaker
- `slidingWindowSize` = 5
- `failureRateThreshold` = 50
- `waitDurationInOpenState` = 5s
- `permittedNumberOfCallsInHalfOpenState` = 3

### Retry
- `maxAttempts` = 3
- `waitDuration` = 1s

### TimeLimiter
- `timeoutDuration` = 2s

### RateLimiter
- `limitForPeriod` = 2
- `limitRefreshPeriod` = 10s

### Bulkhead
- `maxConcurrentCalls` = 1
- `maxWaitDuration` = 0

## API Endpoints

### Direct APIs
- `GET http://localhost:8081/products`
- `GET http://localhost:8082/inventory/1`
- `GET http://localhost:8083/recommendations/1`
- `GET http://localhost:8083/recommendations/1?fail=true`
- `GET http://localhost:8083/recommendations/1?delay=3000`

### Gateway Equivalents
- `GET http://localhost:8084/product-service/products`
- `GET http://localhost:8084/inventory-service/inventory/1`
- `GET http://localhost:8084/recommendation-service/recommendations/1`
- `GET http://localhost:8084/recommendation-service/recommendations/1?fail=true`
- `GET http://localhost:8084/recommendation-service/recommendations/1?delay=3000`

## Testing Commands (PowerShell)
- **Normal request**: `curl.exe -i "http://localhost:8084/recommendation-service/recommendations/1"`
- **Simulated failure**: `curl.exe -i "http://localhost:8084/recommendation-service/recommendations/1?fail=true"`
- **Timeout**: `curl.exe -i "http://localhost:8084/recommendation-service/recommendations/1?delay=3000"`
- **Rate limiting**:
  ```powershell
  1..4 | ForEach-Object { curl.exe -s -i "http://localhost:8084/recommendation-service/recommendations/1" }
  ```
- **Bulkhead concurrency**:
  ```powershell
  $jobs = @(
      Start-Job { curl.exe -s "http://localhost:8083/recommendations/1?delay=5000" }
      Start-Job { curl.exe -s "http://localhost:8083/recommendations/1?delay=5000" }
  )
  ```
- **Actuator health**: `curl.exe -i "http://localhost:8083/actuator/health"`
- **Actuator metrics**: `curl.exe -s "http://localhost:8083/actuator/metrics" | Select-String "resilience4j"`

## Example Responses

**Normal Response:**
```json
{"productId":"1","recommendations":["Accessories","Extended Warranty"]}
```

**Fallback Response:**
```json
{"productId":"1","recommendations":["No recommendations available at this time (Fallback)"]}
```

## Failure Demonstration

- **`?fail=true`**: Bypasses core logic and immediately throws a `RuntimeException`. This simulates a transient failure. It's retried 3 times, fails all 3, the Circuit Breaker records the failure, and returns the fallback.
- **`?delay=3000`**: Thread sleeps for 3 seconds. The `TimeLimiter` (set to 2s) throws a `TimeoutException`. `Retry` attempts it 3 times (taking 8+ seconds total), and ultimately the fallback is invoked.
- **3+ Rapid Requests**: Because `limitForPeriod=2` per 10 seconds, the 3rd request instantly exceeds the rate limit. `RateLimiter` throws `RequestNotPermitted`, triggering the fallback.
- **Two Concurrent Delays**: With `maxConcurrentCalls=1`, one 5s delay request consumes the only permit. A simultaneous request immediately throws a `BulkheadFullException`, proving concurrency restriction.

## Observability
Relevant Actuator metrics available at `http://localhost:8083/actuator/metrics/{metricName}?tag=name:recommendationService`:
- `resilience4j.circuitbreaker.state`
- `resilience4j.circuitbreaker.calls`
- `resilience4j.retry.calls`
- `resilience4j.timelimiter.calls`
- `resilience4j.ratelimiter.available.permissions`
- `resilience4j.bulkhead.available.concurrent.calls`

## Project Structure
```text
CircuitBreaker/
├── PROJECT_SPEC.md
├── ARCHITECTURE.md
├── circuitbreaker-backend/
│   ├── service-registry/
│   ├── api-gateway/
│   ├── product-service/
│   ├── inventory-service/
│   └── recommendation-service/
```

## Git Checkpoints
- `c840658` — feat: add recommendation circuit breaker and fallback
- `0f11e3f` — feat: add retry and timeout resilience
- `e62a6e0` — feat: add rate limiter and bulkhead resilience
- `8bbfd79` — feat: add product and inventory REST APIs

## Known Technical Tradeoff
Architecturally, Rate Limiting operates optimally at the Edge Gateway. However, Spring Cloud Gateway natively depends on Redis for RateLimiting. To maintain a deterministic, self-contained local testing environment without introducing forbidden third-party technologies, **RateLimiter** and **Bulkhead** were explicitly implemented within the **Recommendation Service** via Resilience4j annotations. This enables reliable demonstration of all patterns in isolation.

## Final Validation
- Build: PASS
- Eureka: PASS
- Product Service: PASS
- Inventory Service: PASS
- Recommendation Service: PASS
- API Gateway: PASS
- Circuit Breaker: PASS
- Fallback: PASS
- Retry: PASS
- TimeLimiter: PASS
- RateLimiter: PASS
- Bulkhead: PASS
- Actuator: PASS
- Git: PASS
