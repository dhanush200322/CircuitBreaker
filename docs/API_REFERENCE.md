# CircuitBreaker â€” Complete API Reference Manual

This document provides a detailed reference for all REST API endpoints, actuator metrics, discovery services, and distributed tracing APIs across the **CircuitBreaker** platform.

---

## Table of Contents
1. [Direct Microservice Endpoints](#1-direct-microservice-endpoints)
2. [API Gateway Routed Endpoints](#2-api-gateway-routed-endpoints)
3. [Spring Boot Actuator & Metrics Endpoints](#3-spring-boot-actuator--metrics-endpoints)
4. [Eureka Service Discovery Endpoints](#4-eureka-service-discovery-endpoints)
5. [Zipkin Distributed Tracing Endpoints](#5-zipkin-distributed-tracing-endpoints)
6. [Frontend Reverse Proxy Endpoints](#6-frontend-reverse-proxy-endpoints)

---

## 1. Direct Microservice Endpoints

### 1.1 Product Service (`:8081`)

#### `GET /products`
- **Service**: `product-service`
- **Purpose**: Retrieves the list of available e-commerce products.
- **Headers**: `Accept: application/json`
- **Example Request**:
  ```bash
  curl -i http://localhost:8081/products
  ```
- **Example Response (`HTTP 200 OK`)**:
  ```json
  [
    {
      "id": "1",
      "name": "Laptop",
      "price": 999.99
    },
    {
      "id": "2",
      "name": "Smartphone",
      "price": 599.99
    }
  ]
  ```

---

### 1.2 Inventory Service (`:8082`)

#### `GET /inventory/{productId}`
- **Service**: `inventory-service`
- **Purpose**: Checks the in-stock status and quantity for a specified product ID.
- **Path Parameters**:
  - `productId` *(string, required)*: Unique identifier of the product (e.g. `1`).
- **Example Request**:
  ```bash
  curl -i http://localhost:8082/inventory/1
  ```
- **Example Response (`HTTP 200 OK`)**:
  ```json
  {
    "productId": "1",
    "inStock": true,
    "quantity": 100
  }
  ```

---

### 1.3 Recommendation Service (`:8083`)

#### `GET /recommendations/{productId}`
- **Service**: `recommendation-service`
- **Purpose**: Generates product recommendations with Resilience4j circuit breakers, timeouts, retries, and rate limiting.
- **Path Parameters**:
  - `productId` *(string, required)*: Identifier of the product.
- **Query Parameters**:
  - `fail` *(boolean, optional, default: false)*: When `true`, simulates an internal runtime failure to trigger Circuit Breaker and Fallback.
  - `delay` *(integer, optional, default: 0)*: Simulated execution delay in milliseconds (e.g. `3000` to trigger TimeLimiter timeout).
- **Example Request (Normal)**:
  ```bash
  curl -i http://localhost:8083/recommendations/1
  ```
- **Example Response (Normal â€” `HTTP 200 OK`)**:
  ```json
  {
    "productId": "1",
    "recommendations": [
      "Accessories",
      "Extended Warranty"
    ]
  }
  ```
- **Example Request (Simulated Failure)**:
  ```bash
  curl -i "http://localhost:8083/recommendations/1?fail=true"
  ```
- **Example Response (Fallback â€” `HTTP 200 OK`)**:
  ```json
  {
    "productId": "1",
    "recommendations": [
      "No recommendations available at this time (Fallback)"
    ]
  }
  ```
- **Example Request (Simulated Latency)**:
  ```bash
  curl -i "http://localhost:8083/recommendations/1?delay=3000"
  ```
- **Example Response (Timeout / Fallback â€” `HTTP 200 OK`)**:
  ```json
  {
    "productId": "1",
    "recommendations": [
      "No recommendations available at this time (Fallback)"
    ]
  }
  ```

---

## 2. API Gateway Routed Endpoints (`:8084`)

All client requests should route through the **Spring Cloud Gateway** (`http://localhost:8084`) using the lower-case service name prefix.

### 2.1 Route to Product Service
- **Endpoint**: `GET http://localhost:8084/product-service/products`
- **Gateway Route**: Forwards to `http://localhost:8081/products` via Eureka discovery.
- **Example Request**:
  ```bash
  curl -i http://localhost:8084/product-service/products
  ```

### 2.2 Route to Inventory Service
- **Endpoint**: `GET http://localhost:8084/inventory-service/inventory/{productId}`
- **Gateway Route**: Forwards to `http://localhost:8082/inventory/{productId}`.
- **Example Request**:
  ```bash
  curl -i http://localhost:8084/inventory-service/inventory/1
  ```

### 2.3 Route to Recommendation Service
- **Endpoint**: `GET http://localhost:8084/recommendation-service/recommendations/{productId}`
- **Gateway Route**: Forwards to `http://localhost:8083/recommendations/{productId}`.
- **Example Requests**:
  ```bash
  # Normal
  curl -i http://localhost:8084/recommendation-service/recommendations/1

  # Failure Chaos
  curl -i "http://localhost:8084/recommendation-service/recommendations/1?fail=true"

  # Latency Chaos
  curl -i "http://localhost:8084/recommendation-service/recommendations/1?delay=3000"
  ```

---

## 3. Spring Boot Actuator & Metrics Endpoints

### 3.1 Health Endpoint
- **Endpoint**: `GET http://localhost:8083/actuator/health`
- **Purpose**: Returns application status, disk space, and Eureka discovery health.
- **Example Response (`HTTP 200 OK`)**:
  ```json
  {
    "status": "UP",
    "components": {
      "circuitBreakers": {
        "status": "UP",
        "details": {
          "recommendationService": {
            "status": "UP",
            "details": {
              "failureRate": "-1.0%",
              "failureRateThreshold": "50.0%",
              "slowCallRate": "-1.0%",
              "slowCallRateThreshold": "100.0%",
              "bufferedCalls": 0,
              "slowCalls": 0,
              "slowFailedCalls": 0,
              "failedCalls": 0,
              "notPermittedCalls": 0,
              "state": "CLOSED"
            }
          }
        }
      },
      "discoveryComposite": {
        "status": "UP"
      },
      "diskSpace": {
        "status": "UP"
      },
      "ping": {
        "status": "UP"
      }
    }
  }
  ```

### 3.2 Resilience4j Circuit Breaker Metrics
- **Circuit Breaker State**:
  `GET http://localhost:8083/actuator/metrics/resilience4j.circuitbreaker.state?tag=name:recommendationService&tag=state:closed`
- **Circuit Breaker Total Calls**:
  `GET http://localhost:8083/actuator/metrics/resilience4j.circuitbreaker.calls?tag=name:recommendationService`
- **Circuit Breaker Failure Rate**:
  `GET http://localhost:8083/actuator/metrics/resilience4j.circuitbreaker.failure.rate?tag=name:recommendationService`
- **Not Permitted Calls**:
  `GET http://localhost:8083/actuator/metrics/resilience4j.circuitbreaker.not.permitted.calls?tag=name:recommendationService`

### 3.3 Resilience4j Retry Metrics
- **Retry Invocations**:
  `GET http://localhost:8083/actuator/metrics/resilience4j.retry.calls?tag=name:recommendationService`

### 3.4 Resilience4j TimeLimiter Metrics
- **Timeout Invocations**:
  `GET http://localhost:8083/actuator/metrics/resilience4j.timelimiter.calls?tag=name:recommendationService&tag=kind:timeout`

### 3.5 Resilience4j RateLimiter Metrics
- **Available Permissions**:
  `GET http://localhost:8083/actuator/metrics/resilience4j.ratelimiter.available.permissions?tag=name:recommendationService`

### 3.6 Resilience4j Bulkhead Metrics
- **Available Concurrency**:
  `GET http://localhost:8083/actuator/metrics/resilience4j.bulkhead.available.concurrent.calls?tag=name:recommendationService`
- **Max Allowed Concurrency**:
  `GET http://localhost:8083/actuator/metrics/resilience4j.bulkhead.max.allowed.concurrent.calls?tag=name:recommendationService`

---

## 4. Eureka Service Discovery Endpoints (`:8080`)

### `GET /eureka/apps`
- **Purpose**: Returns the full XML/JSON registration tree of all active microservice instances.
- **Headers**: `Accept: application/json`
- **Example Request**:
  ```bash
  curl -s -H "Accept: application/json" http://localhost:8080/eureka/apps
  ```
- **Example Response**:
  ```json
  {
    "applications": {
      "application": [
        {
          "name": "API-GATEWAY",
          "instance": [ { "port": { "$": 8084 }, "status": "UP" } ]
        },
        {
          "name": "PRODUCT-SERVICE",
          "instance": [ { "port": { "$": 8081 }, "status": "UP" } ]
        },
        {
          "name": "INVENTORY-SERVICE",
          "instance": [ { "port": { "$": 8082 }, "status": "UP" } ]
        },
        {
          "name": "RECOMMENDATION-SERVICE",
          "instance": [ { "port": { "$": 8083 }, "status": "UP" } ]
        }
      ]
    }
  }
  ```

---

## 5. Zipkin Distributed Tracing Endpoints (`:9411`)

### 5.1 Ingest Spans (Internal)
- **Endpoint**: `POST http://localhost:9411/api/v2/spans`
- **Purpose**: Ingestion endpoint used by `zipkin-reporter-brave` to submit asynchronous JSON span batches.

### 5.2 List Traced Services
- **Endpoint**: `GET http://localhost:9411/api/v2/services`
- **Purpose**: Returns array of service names that have emitted spans.
- **Example Response**:
  ```json
  ["api-gateway", "inventory-service", "product-service", "recommendation-service"]
  ```

### 5.3 Query Traces by Service
- **Endpoint**: `GET http://localhost:9411/api/v2/traces?serviceName={serviceName}&limit={limit}`
- **Purpose**: Returns recent distributed traces matching service name filter.
- **Example Request**:
  ```bash
  curl -s "http://localhost:9411/api/v2/traces?serviceName=api-gateway&limit=1"
  ```

---

## 6. Frontend Reverse Proxy Endpoints (`:5173`)

The React development server exposes convenient path proxies configured in `vite.config.ts`:

| Proxy Prefix | Target Backend URL | Description |
|:---|:---|:---|
| `/gateway/*` | `http://localhost:8084/*` | Forwards API requests directly to the Spring Cloud Gateway. |
| `/actuator/*` | `http://localhost:8083/actuator/*` | Forwards metrics requests to Recommendation Service Actuator. |
| `/eureka-api/*` | `http://localhost:8080/eureka/*` | Queries Eureka registry with `Accept: application/json`. |
| `/zipkin/*` | `http://localhost:9411/*` | Queries Zipkin REST API for services and trace summaries. |
