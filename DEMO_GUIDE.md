# 🚀 CircuitBreaker Live Demonstration Guide

This guide provides a concise 5–10 minute live demonstration sequence to showcase the Resilience4j fault tolerance implementation.

> **Prerequisite:** Ensure all 5 Spring Boot microservices (Eureka, API Gateway, Product, Inventory, Recommendation) are running.

### 1. Show Eureka
*Demonstrates that the Service Registry is active and all services are registered.*
**Command:**
```powershell
curl.exe -s http://localhost:8080/eureka/apps
```
**Observe:** Look for `API-GATEWAY`, `PRODUCT-SERVICE`, `INVENTORY-SERVICE`, and `RECOMMENDATION-SERVICE` showing `<status>UP</status>`.

### 2. Show Product API
*Demonstrates a successful direct call to the upstream product domain.*
**Command:**
```powershell
curl.exe -i http://localhost:8081/products
```
**Observe:** HTTP 200 OK and a JSON array of products.

### 3. Show Inventory API
*Demonstrates a successful direct call to the upstream inventory domain.*
**Command:**
```powershell
curl.exe -i http://localhost:8082/inventory/1
```
**Observe:** HTTP 200 OK and inventory quantity data.

### 4. Show Recommendation API
*Demonstrates a successful direct call to the Recommendation domain.*
**Command:**
```powershell
curl.exe -i http://localhost:8083/recommendations/1
```
**Observe:** HTTP 200 OK and an array of recommendations `["Accessories","Extended Warranty"]`.

### 5. Show Gateway Routing
*Demonstrates dynamic `lb://` routing through the Spring Cloud Gateway.*
**Command:**
```powershell
curl.exe -i http://localhost:8084/product-service/products
```
**Observe:** HTTP 200 OK proving the Gateway is dynamically discovering and routing to the Product service.

### 6. Demonstrate Circuit Breaker (and Fallback)
*Demonstrates the fallback mechanism kicking in on simulated failure.*
**Command:**
```powershell
curl.exe -i "http://localhost:8084/recommendation-service/recommendations/1?fail=true"
```
**Observe:** HTTP 200 OK but with the fallback payload: `["No recommendations available at this time (Fallback)"]`.

### 7. Demonstrate Retry & TimeLimiter (8)
*Demonstrates the Timeout forcing a failure, and the Retry extending the total request time.*
**Command:**
```powershell
Measure-Command { curl.exe -s -i "http://localhost:8084/recommendation-service/recommendations/1?delay=3000" }
```
**Observe:** The request takes approximately 8 seconds (2s timeout + 1s wait, retried 3 times), finally yielding the Fallback payload. This proves the time limiter is active and the retry logic is wrapping it!

### 9. Demonstrate RateLimiter
*Demonstrates the API restricting rapid traffic spikes.*
**Command:**
```powershell
1..4 | ForEach-Object { echo "--- REQUEST $_ ---" ; curl.exe -s -i "http://localhost:8084/recommendation-service/recommendations/1" ; echo "" }
```
**Observe:** The first two requests return the normal response. The 3rd and 4th instantly return the Fallback response because the 2-per-10s limit is exhausted. *(Make sure to wait 10 seconds before demonstrating to get a fresh window).*

### 10. Demonstrate Bulkhead
*Demonstrates thread pool/semaphore isolation restricting concurrent capacity.*
**Command:**
```powershell
$jobs = @(
    Start-Job { curl.exe -s "http://localhost:8083/recommendations/1?delay=5000" }
    Start-Job { curl.exe -s "http://localhost:8083/recommendations/1?delay=5000" }
)
$jobs | Wait-Job | Out-Null
$jobs | Receive-Job
$jobs | Remove-Job
```
**Observe:** One request succeeds (or times out and falls back after execution), while the other instantly degenerates to the Fallback response without waiting, proving `maxConcurrentCalls=1` is enforced.

### 11. Show Actuator Metrics
*Demonstrates full observability into the resilience states.*
**Command:**
```powershell
curl.exe -s "http://localhost:8083/actuator/metrics/resilience4j.circuitbreaker.state?tag=name:recommendationService"
```
**Observe:** Metrics proving the state of the circuit breaker (e.g. `CLOSED` or `OPEN`). You can also substitute `resilience4j.circuitbreaker.state` with any of the other patterns to observe their metrics.

### 12. Explain Architecture
**Conclude the demo by summarizing the flow:** 
The Gateway handled edge protection, Eureka managed dynamic routing, but it was the **Resilience4j nested configuration (CircuitBreaker → RateLimiter → Bulkhead → Retry → TimeLimiter)** directly in the Recommendation Service that handled failures gracefully and deterministically without taking the whole system offline.
