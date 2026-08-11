# CircuitBreaker — System Architecture

## 1. Architecture Overview

The CircuitBreaker project is a cloud-native e-commerce backend built on a microservices architecture. It demonstrates API routing, dynamic service discovery, and robust resilience patterns to prevent cascading failures.

At a high level, the system consists of the following components:

- **React Frontend / Monitoring Interface**: Provides a user interface for system monitoring and visualizing chaos experiments and circuit breaker states.
- **Spring Cloud Gateway**: Acts as the single entry point for all incoming API requests. It handles routing and delegates requests to the appropriate backend microservices.
- **Eureka Service Registry**: Provides dynamic service discovery, allowing microservices to register themselves and discover one another without hardcoded network configurations.
- **Product Service**: A core microservice responsible for managing product information.
- **Inventory Service**: A core microservice responsible for tracking stock levels.
- **Recommendation Service**: A core microservice responsible for generating product suggestions.
- **Resilience4j**: Integrated at the service boundaries to provide fault tolerance through patterns like Circuit Breaker, Rate Limiting, Bulkhead, Timeout, Retry, and Fallback.
- **Micrometer Tracing & Zipkin**: Working together to provide distributed tracing across the microservices landscape, enabling observability by capturing request latency and execution paths.

### High-Level Request Flow

1. An external request or the **React Frontend** initiates an HTTP request.
2. The request arrives at the **Spring Cloud Gateway**.
3. The Gateway queries the **Eureka Service Registry** to discover the available instances of the required downstream microservice.
4. The Gateway routes the request to the target microservice (**Product Service**, **Inventory Service**, or **Recommendation Service**).
5. Any inter-service communication is similarly resolved dynamically via Eureka.
6. Network boundaries and dependencies are guarded by **Resilience4j**, ensuring that if a downstream service fails or degrades, the caller handles it gracefully (e.g., via a fallback mechanism) to prevent cascading failures.
7. Throughout this lifecycle, **Micrometer Tracing** propagates trace contexts across service boundaries, and metrics are sent to **Zipkin** for centralized observability.

## 2. Client / Frontend

The Client layer consists of a **React-based frontend**, which acts primarily as a monitoring, chaos testing, and visualization interface for the system.

### Responsibilities
- **System Monitoring**: Provides real-time visibility into the health and status of the backend microservices.
- **Chaos UI / Simulation**: Enables users to trigger chaos experiments, such as simulating latency, to observe how the resilience patterns prevent cascading failures.
- **Circuit Breaker Visualization**: Visually represents the real-time states of the Circuit Breakers (e.g., Closed, Open, Half-Open) provided by Resilience4j.

### Communication
The React frontend communicates exclusively with the backend by sending API requests to the **Spring Cloud Gateway**. The Gateway serves as the single unified entry point, routing the frontend's monitoring and interaction requests to the appropriate backend services.

## 3. API Gateway

The **Spring Cloud Gateway** serves as the central entry point for all incoming traffic from the Client/Frontend interface.

### Roles and Responsibilities
- **Central Entry Point**: Acts as the single interface between the frontend monitoring UI and the internal microservice ecosystem.
- **Request Routing**: Intelligently routes incoming API requests to the appropriate backend microservices (e.g., Product Service, Inventory Service, or Recommendation Service).
- **Service Discovery Integration**: Integrates directly with the **Eureka Service Registry**. The Gateway resolves dynamic routing by querying Eureka to locate available instances of target microservices, eliminating the need for hardcoded network addresses.
- **Resilience and Edge Protection**: Integrates with **Resilience4j** to apply fault-tolerance patterns directly at the edge. By utilizing patterns such as Circuit Breakers, Rate Limiting, and Timeouts, the Gateway acts as a protective barrier. It intercepts failures, fails fast when necessary, and provides fallback responses to prevent failures from cascading to other downstream services.

## 4. Service Discovery

The architecture utilizes **Spring Cloud Netflix Eureka** to handle dynamic service registration and discovery.

### Role and Mechanics
- **Service Registry**: Eureka serves as the centralized directory for the entire system.
- **Microservice Registration**: Upon startup, the core microservices—**Product Service**, **Inventory Service**, and **Recommendation Service**—act as Eureka clients and automatically register their availability and network locations with the Eureka server.
- **Dynamic Discovery**: The registry enables microservices to locate one another dynamically at runtime, removing the need to manage hardcoded hostnames, IP addresses, or static port configurations.
- **Gateway Integration**: The **Spring Cloud Gateway** queries the Eureka Service Registry to resolve the physical locations of backend microservices. This allows the Gateway to seamlessly route incoming frontend traffic to healthy backend instances.
- **Architectural Benefits**: Dynamic service registration and discovery decouple the services from static network topologies. This enables automatic load balancing, seamless horizontal scaling of service instances, and improved fault tolerance when instances inevitably fail or are restarted.

## 5. Product Service

The **Product Service** is one of the core backend microservices in the CircuitBreaker cloud-native e-commerce architecture.

### Architectural Role
- **Domain Responsibility**: It serves as a fundamental building block of the backend system, managing product-related operations within the microservices ecosystem.
- **Service Registration**: On startup, the Product Service acts as a Eureka client and dynamically registers its network location with the **Eureka Service Registry**.
- **Gateway Accessibility**: External frontend requests reach the Product Service exclusively through the **Spring Cloud Gateway**. The Gateway dynamically discovers the Product Service via Eureka and securely routes traffic to it.
- **Request Flow Participation**: The Product Service actively participates in the broader distributed request flow, processing incoming domain queries and interacting seamlessly with the overall microservice architecture.
- **Resilience Architecture**: The Product Service is fully integrated into the system's fault-tolerance boundaries. If the service experiences latency or fails, **Resilience4j** configurations (applied at the Gateway or by dependent calling services) trigger patterns like Timeouts, Fallbacks, or Circuit Breakers to isolate the issue and prevent cascading failures.

## 6. Inventory Service

The **Inventory Service** is one of the three core backend microservices within the CircuitBreaker cloud-native e-commerce architecture.

### Architectural Role
- **Domain Responsibility**: It functions as an essential component of the microservice ecosystem, responsible for tracking and managing stock levels.
- **Service Registration**: Upon startup, the Inventory Service automatically acts as a Eureka client, registering its network location and availability with the **Eureka Service Registry**.
- **Gateway Accessibility**: The service is exposed to frontend traffic exclusively via the **Spring Cloud Gateway**. The Gateway dynamically resolves the Inventory Service's location through Eureka before routing external requests to it.
- **Inter-Service Communication**: As a core backend service, it participates seamlessly in the internal distributed request flow. Any dependent microservices interacting with the Inventory Service resolve its location dynamically via Eureka.
- **Resilience Integration**: The Inventory Service operates safely within the system's fault-tolerance boundaries. Requests targeting the Inventory Service are guarded by **Resilience4j** configurations (e.g., Circuit Breakers, Timeouts) applied at the Gateway or by dependent calling services. This ensures that localized latency or failures are isolated, preventing cascading failures across the platform.

## 7. Recommendation Service

The **Recommendation Service** is one of the three core backend microservices within the CircuitBreaker cloud-native e-commerce architecture.

### Architectural Role
- **Domain Responsibility**: It functions as a core component of the backend ecosystem, responsible for generating and serving product suggestions.
- **Service Registration**: Upon startup, the Recommendation Service acts as a Eureka client, automatically registering its network location and availability with the **Eureka Service Registry**.
- **Gateway Accessibility**: The service receives frontend traffic exclusively through the **Spring Cloud Gateway**. The Gateway queries Eureka to dynamically resolve the Recommendation Service's location before routing requests to it.
- **Inter-Service Communication**: As a core backend service, it participates in the internal distributed request flow. Any dependent services interacting with the Recommendation Service will resolve its location dynamically via Eureka.
- **Resilience and Fallback Demonstration**: The Recommendation Service is uniquely highlighted in the architecture to demonstrate fault tolerance. In the Phase 2 (Week 2) implementation, it serves as the primary target for configuring **Resilience4j Circuit Breaker** and explicit **fallback behaviors**. This ensures that if the recommendation engine experiences latency or fails, the calling service or Gateway executes a fallback response, allowing the system to degrade gracefully rather than causing a cascading failure.

## 8. Resilience Layer

The resilience architecture is powered by **Resilience4j**, which acts as the core framework to protect the distributed system against cascading failures.

### Core Resilience Patterns
The following patterns are integrated across the microservices landscape:
- **Circuit Breaker**: Prevents the system from repeatedly attempting calls to a failing or unresponsive service.
- **Retry**: Automatically reattempts transiently failed requests.
- **Timeout**: Enforces strict execution time limits to prevent resource exhaustion when downstream dependencies hang.
- **Rate Limiting**: Restricts the volume of incoming traffic, preventing service overload.
- **Bulkhead**: Limits the number of concurrent executions to prevent one failing component from consuming all available system resources.
- **Fallback**: Provides graceful degradation by supplying a default response or alternative logic when a request fails or is rejected.

### High-Level Component Relationships
- **Spring Cloud Gateway & Backend Microservices**: Resilience4j is implemented both at the edge (**Spring Cloud Gateway**) and within the **backend microservices**. The Gateway acts as a protective shield, intercepting frontend traffic and preventing it from overwhelming failing backends. Simultaneously, when backend microservices communicate with one another, they utilize Resilience4j to guard their internal dependencies.
- **Failure and Fallback Behavior**: When a failure occurs or a service becomes degraded, Resilience4j intercepts the request. If a Circuit Breaker opens, a Bulkhead limits capacity, or a Timeout occurs, the system executes predefined **Fallback** logic to return a safe response rather than propagating an error to the user.

### Project Implementation Phases
- **Recommendation Service Fallback (Week 2)**: The architecture explicitly targets the Recommendation Service to configure Circuit Breaker and fallback behaviors. If the recommendation engine is unavailable, the system degrades gracefully by executing the fallback.
- **Rate Limiting and Bulkheads (Week 3)**: The resilience strategy expands to include Rate Limiting and Bulkhead implementations to further shield the system from traffic bursts and resource starvation.
- **Monitoring and Simulation**:
  - The architecture includes a monitoring / chaos UI that actively **visualizes Circuit Breaker states**.
  - **Latency simulation** is explicitly added (Week 4) to introduce artificial delays, allowing developers to observe and verify that the Resilience4j patterns successfully prevent cascading failures under stress.

## 9. Observability and Distributed Tracing

Observability is a critical component of the architecture, ensuring that the distributed nature of the system remains transparent and debuggable. The system relies on **Micrometer Tracing** and **Zipkin** to achieve distributed tracing across the microservices landscape.

### Core Observability Components
- **Micrometer Tracing**: Embedded within the microservices, this library automatically instruments the applications to capture telemetry data. It generates and propagates unique trace IDs and span IDs as requests traverse service boundaries.
- **Zipkin**: Acts as the centralized distributed tracing system and visualization interface. It collects, aggregates, and displays the trace data transmitted by the microservices.

### Role of Distributed Tracing
Distributed tracing allows developers to observe the complete lifecycle of a single request as it flows across multiple microservices. This deep visibility into service-to-service behavior makes it possible to pinpoint performance bottlenecks, diagnose failing downstream dependencies, and verify the effectiveness of the resilience mechanisms.

### Conceptual Tracing Flow
1. **Microservice Request**: An external request enters the system (via the Gateway) or an internal inter-service call is initiated.
2. **Micrometer Tracing**: The tracing instrumentation intercepts the request, propagating the distributed trace context and recording timing metrics.
3. **Distributed Trace**: The telemetry data is structured into spans representing the work done by individual services.
4. **Zipkin**: The distributed trace data is transmitted to the centralized Zipkin server for aggregation and visualization.

### Project Implementation Phases
- **Week 4 Integration**: Observability is explicitly formalized during the final week of development, during which Micrometer Tracing and Zipkin are fully integrated into the architecture.
- **Latency Simulation**: Alongside tracing, artificial latency simulation is introduced in Week 4. Distributed tracing is used to visualize and analyze the exact impact of this simulated latency on the request flow, proving that the resilience patterns successfully prevent cascading failures.

## 10. Service Communication

The architecture employs a synchronous request-response communication model across its distributed components, relying heavily on dynamic service discovery to route traffic efficiently.

### Edge Communication
- **React Frontend to Gateway**: The React frontend does not communicate directly with the individual backend microservices. Instead, all external frontend traffic is sent directly to the **Spring Cloud Gateway**, which acts as the central, unified entry point for the backend ecosystem.

### Gateway to Microservice Routing
- **Dynamic Routing via Eureka**: To route incoming requests, the Gateway utilizes **Eureka Service Discovery**. It queries the registry to resolve the network locations of the backend services.
- **Synchronous Forwarding**: Upon receiving a frontend request and querying Eureka, the Gateway forwards the request synchronously to the appropriate independently registered microservice—the **Product Service**, **Inventory Service**, or **Recommendation Service**.

### Internal Service-to-Service Communication
- **Microservice Interactions**: The system utilizes service-to-service communication to fulfill complex business operations. When one backend microservice requires data from another, it queries the Eureka registry to discover the target service and makes a synchronous network call to retrieve the necessary information.

### Resilience in Communication
- **Resilience4j Safeguards**: Because network communication in a distributed system is prone to latency and failure, all gateway-to-service and service-to-service communication is safeguarded by the **Resilience4j** layer. If communication fails or times out, Resilience4j intercepts the failure and executes fallback logic or opens a circuit breaker, effectively protecting the caller and preventing cascading failures from reaching the frontend client.

## 11. Request Flow

This section describes the normal, successful request lifecycle within the architecture. (Failure and fallback behaviors are detailed in the subsequent section.)

### Standard High-Level Flow
A successful synchronous request follows this conceptual path:
1. **React Frontend**: Initiates an API request for data or monitoring operations.
2. **Spring Cloud Gateway**: Receives the request acting as the central entry point.
3. **Eureka Service Discovery**: The Gateway queries the registry to discover the location of the target backend microservice.
4. **Resilience4j**: The request passes through the Gateway's configured resilience layer, which simply monitors the request (e.g., tracking execution time or concurrency) during a healthy operation.
5. **Appropriate Backend Microservice**: The Gateway routes the request to the target microservice, which processes the domain logic.
6. **Response**: The microservice generates a successful response and sends it back to the Gateway.
7. **Gateway to Frontend**: The Gateway forwards the final response back to the React Frontend.

### Conceptual Examples

#### Product Service Flow
- The frontend requests product catalog information.
- The Gateway intercepts the request, queries Eureka to locate a healthy instance of the **Product Service**, and forwards the traffic.
- The Product Service successfully retrieves the product details and returns the response back through the Gateway to the frontend.

#### Inventory Service Flow
- The frontend requests stock availability data.
- The Gateway intercepts the request, queries Eureka to locate a healthy instance of the **Inventory Service**, and forwards the traffic.
- The Inventory Service successfully determines the stock levels and returns the inventory data back through the Gateway to the frontend.

#### Recommendation Service Flow
- The frontend requests product suggestions.
- The Gateway intercepts the request, queries Eureka to locate a healthy instance of the **Recommendation Service**, and forwards the traffic.
- The Recommendation Service successfully computes the suggestions and returns the recommended products back through the Gateway to the frontend.

## 12. Failure / Fallback Flow

This section details how the architecture handles failure, latency, and system degradation to prevent cascading failures.

### High-Level Failure Flow
When a downstream service becomes unresponsive or degraded, the request follows this conceptual path:
1. **Request**: An external or internal request is initiated.
2. **Gateway / Backend Service**: The request arrives at a protected network boundary.
3. **Downstream Service Failure or Latency**: The target microservice experiences an issue, such as a timeout or a crash.
4. **Resilience4j**: The resilience framework actively intercepts the failing communication.
5. **Circuit Breaker / Resilience Pattern**: A configured pattern (e.g., an open Circuit Breaker) is triggered to halt the failing calls.
6. **Fallback or Controlled Response**: Instead of propagating an exception, the system executes predefined fallback logic.
7. **Client**: A safe, controlled response is returned to the original caller.

### Key Resilience Mechanics
- **Resilience4j Framework**: Acts as the system's core defense mechanism, protecting communication at the Gateway and between microservices.
- **Circuit Breaker**: Conceptually monitors request success rates. If failures exceed a certain limit, the breaker "opens," immediately rejecting subsequent requests to give the failing service time to recover, before transitioning to a "half-open" state to test recovery.
- **Timeout and Retry**: Safeguard against hanging processes by enforcing strict execution time limits and automatically reattempting transient network failures.
- **Protection Against Cascading Failures**: By failing fast and executing fallbacks, the system prevents a localized issue in one microservice from exhausting threads and resources across the entire ecosystem.

### Project Implementation Phases
- **Recommendation Service Fallback (Week 2)**: The architecture explicitly targets the Recommendation Service to demonstrate failure handling. If the recommendation engine fails or exceeds allowed latency, a **Fallback** response is returned so the core e-commerce flow remains functional.
- **Rate Limiting and Bulkhead (Week 3)**: The resilience strategy is expanded. **Rate Limiting** protects the system from traffic spikes, while **Bulkheads** restrict concurrent execution capacity, ensuring that a single struggling component cannot consume all available system resources.
- **Latency Simulation and Visualization**: The architecture incorporates **latency simulation** to artificially introduce delays into the system. This allows developers to prove that the resilience mechanisms work. The resulting **Circuit Breaker states** are actively visualized within the monitoring interface.

## 13. Technology Stack

This technology stack is constructed strictly from the four official Axlero internship documents.

### Programming Language
- **Java**: Project-required

### Backend
- **Spring Boot**: Project-required
- **Spring Cloud Gateway**: Project-required

### Service Discovery
- **Eureka**: Selected by us
- **Consul**: Documented option (Not selected)

### Resilience
- **Resilience4j**: Project-required
- **Circuit Breaker**: Project-required
- **Retry**: Project-required
- **Timeout**: Project-required
- **Rate Limiter**: Project-required
- **Bulkhead**: Project-required
- **Fallback**: Project-required

### Frontend
- **React**: Project-required
- **Spring Boot Admin**: Curriculum-supported (Not mandatory; to be decided if required later)

### Observability
- **Micrometer Tracing**: Project-required
- **Zipkin**: Project-required

### Build
- **Maven**: Selected by us (Verified Maven 3.9.16 is installed)
- **Gradle**: Documented option (Not selected)

### Containerization
- **Docker**: Curriculum-supported
- **Docker Compose**: Curriculum-supported

### Testing
- **JUnit 5**: Curriculum-supported
- **Mockito**: Curriculum-supported

### Version Control
- **Git**: Project-required
- **GitHub**: Project-required

### CI/CD
- **CI/CD Tools**: To be decided (Will strictly select from options explicitly supported by the Java Dev Session Plan when necessary).

### Cloud / Deployment
- **Deployment Technologies**: To be decided (Immediate cloud deployment is not required; will select from options explicitly supported by the Java Dev Session Plan when necessary).

## 14. Local Development Architecture

This section describes the logical layout of the system during local development. 

### Local Logical Architecture
The core **project architecture** operates with the following conceptual request flow on the developer's local machine:

```text
React Frontend
        ↓
Spring Cloud Gateway
        ↓
Eureka Service Registry
        ↓
Product Service
Inventory Service
Recommendation Service
```

### Local Resilience and Observability Flow
The supporting architectural layers intercept, protect, and monitor the local backend traffic as follows:

```text
Backend Services
        ↓
Resilience4j
        ↓
Micrometer Tracing
        ↓
Zipkin
```

### Local Environment Tooling
The local environment leverages a combination of required architecture and curriculum-supported tools:
- **Curriculum-Supported Containerization**: **Docker** and **Docker Compose** serve as the primary curriculum-supported local tooling. They are used to containerize and orchestrate the distributed microservices architecture—including infrastructure components like Eureka and Zipkin—allowing developers to spin up the entire ecosystem seamlessly on a single local machine.
- **Service Isolation**: Each microservice operates independently within the local environment, ensuring that dynamic routing, service discovery, and Resilience4j behaviors can be developed, simulated, and tested accurately before deployment.

### Implementation Details (To Be Decided)
The following specific implementation details remain explicitly **to be decided** during the upcoming development phases. No assumptions are made regarding these properties at the architectural level:
- **Network Bindings**: Exact `localhost` port allocations for the Gateway, Eureka, Zipkin, React Frontend, and individual Microservices.
- **Container Configuration**: Specific Docker image names, container names, and custom Docker networks.
- **Environment Properties**: The environment variables and local credentials required for cross-service communication.
- **Data Persistence / Databases**: No database servers or database credentials are assumed, as they are not explicitly mandated by the core CircuitBreaker project documentation at this stage.
- **API Interfaces**: The specific API endpoints and URIs utilized for local testing.

## 15. Future Deployment Architecture

This section describes the conceptual deployment architecture for the system, drawing upon curriculum-supported methodologies. It serves strictly as a blueprint for future phases; immediate cloud deployment is not a project requirement.

### Conceptual CI/CD Pipeline
The future continuous integration and deployment pipeline will follow this high-level conceptual flow:

```text
GitHub
   ↓
CI/CD
   ↓
Build
   ↓
Test
   ↓
Docker
   ↓
Cloud Deployment
```

### Technology Distinctions
To remain aligned with the internship documentation, future deployment choices are categorized as follows:

1. **Project-Required Technologies**
   - The core application components (Spring Cloud Gateway, Eureka, backend microservices, Resilience4j, Micrometer Tracing, React) represent the mandatory payload for any deployment scenario.

2. **Curriculum-Supported Deployment Technologies**
   - **CI/CD Tools**: **GitHub Actions** and **Jenkins** are explicitly introduced in the Java Dev Session Plan, representing the primary curriculum-supported options for pipeline automation.
   - **Build & Test Automation**: The automated execution of **Maven/Gradle** builds and tests (e.g., JUnit) are curriculum-supported practices to validate the codebase prior to containerization.
   - **Containerization**: **Docker** and **Docker Compose** serve as the foundational curriculum-supported tools to package the system for cloud execution.
   - **Backend Deployment**: Deploying the Spring Boot APIs to **AWS** is a supported curriculum direction.
   - **Frontend Deployment**: **Vercel** or **AWS (S3/CloudFront)** are documented in the training materials as supported platforms for hosting the React frontend.

3. **Future Implementation Decisions**
   - The specific selection of a CI/CD platform (e.g., Jenkins vs. GitHub Actions) and the exact Cloud hosting environment (e.g., specific AWS services) are marked as **future implementation decisions**. They are not currently mandated by the core CircuitBreaker project requirements.

### Implementation Details (To Be Decided)
No deployment infrastructure is established at this stage. The following specifics remain explicitly **to be decided** when transitioning to a production-like environment:
- Specific AWS account configurations, EC2 instance IDs, or Elastic Beanstalk settings.
- Vercel project configurations, S3 bucket names, or CloudFront distributions.
- Custom domain names, production URLs, or TLS certificates.
- Production environment variables, secrets, and cloud credentials.
- Actual CI/CD YAML workflows, Jenkinsfiles, or automated deployment scripts.
- Specific Docker image registries and tags.
