# CircuitBreaker — Project Specification

## Project

CircuitBreaker — Cloud-Native E-Commerce API Gateway

## Domain

Microservices Architecture & Cloud-Native Resilience

## Objective

Build a cloud-native e-commerce backend demonstrating API Gateway routing,
service discovery, and resilience patterns that prevent cascading failures
between microservices.

## Core Services

- Product Service
- Inventory Service
- Recommendation Service

## Infrastructure Components

- Spring Cloud Gateway
- Eureka Service Registry
- Resilience4j
- Micrometer Tracing
- Zipkin

## Frontend

React-based monitoring / visualization interface.

## Resilience Features

- Circuit Breaker
- Rate Limiting
- Bulkhead
- Timeout
- Retry
- Fallback

## Development Phases

### Week 1
- Build Product Service
- Build Inventory Service
- Build Recommendation Service
- Set up Eureka Service Registry
- Set up Spring Cloud Gateway

### Week 2
- Integrate Resilience4j
- Configure Circuit Breaker
- Configure Recommendation Service fallback
- Create monitoring / chaos UI

### Week 3
- Implement Rate Limiting
- Implement Bulkheads
- Visualize Circuit Breaker states

### Week 4
- Integrate Micrometer Tracing
- Integrate Zipkin
- Add latency simulation
- Finalize monitoring UI

## Technology Rules

1. Use technologies explicitly specified by the project documentation.
2. Where the documentation provides alternatives, select only from those alternatives.
3. Technologies not specified by the documentation may be selected when required.
4. Do not introduce unrelated technologies without justification.
5. Keep the implementation aligned with the official Axlero project documents.

## Repository

GitHub:
https://github.com/dhanush200322/CircuitBreaker

## Current Environment

- Java 17.0.17
- Maven 3.9.16
- Node.js 20.19.4
- npm 11.11.1
- Git 2.51.0
- Docker 29.5.3
- Docker Compose 5.1.4
