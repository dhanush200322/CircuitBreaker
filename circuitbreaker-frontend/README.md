# ⚡ CircuitBreaker Frontend — Observability & Chaos Dashboard

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-black.svg)](https://circuit-breaker-one.vercel.app/)

A real-time reactive observability dashboard built for the **CircuitBreaker** platform. It provides live telemetry for microservices discovery, Resilience4j circuit breaker state transitions, distributed Zipkin tracing waterfalls, and interactive chaos injection controls.

---

## 🌟 Key Features

* 📊 **Live Eureka Service Status Cards**: Real-time health monitoring of all backend microservices (`API-GATEWAY`, `EUREKA-REGISTRY`, `PRODUCT-SERVICE`, `INVENTORY-SERVICE`, `RECOMMENDATION-SERVICE`).
* ⚡ **Resilience4j Metrics Visualization**: Streams live metrics from Spring Boot Actuator showing failure rate thresholds, retry counts, time-limiter timeouts, rate-limiter available permits, and bulkhead concurrent call limits.
* 🛡️ **Interactive Chaos Controls**: On-demand failure and latency injection to test circuit breaker state transitions (`CLOSED` ➔ `OPEN` ➔ `HALF-OPEN`) and fallback responses in real time.
* 🔍 **Zipkin Distributed Tracing**: Displays trace IDs, execution durations, and end-to-end service call chains (`api-gateway ➔ recommendation-service`).
* 🚀 **Automated Multi-Service Warm-Up**: Automatically sends non-blocking background ping requests to wake up all 6 backend services simultaneously upon initial page load.

---

## 🛠️ Technology Stack

* **Framework**: React 19 + TypeScript
* **Build Tool**: Vite 5
* **Styling**: Tailwind CSS
* **Icons**: Lucide React
* **Deployment**: Vercel Edge Network

---

## 📂 Directory Structure

```text
circuitbreaker-frontend/
├── public/                # Static assets & favicons
├── src/
│   ├── components/        # UI Cards & Interactive Controls
│   │   ├── ChaosControls.tsx         # Failure & Latency Injection Panel
│   │   ├── CircuitBreakerCard.tsx    # State & Metrics Visualizer
│   │   ├── Header.tsx                # App Navigation & System Status
│   │   ├── MetricsCard.tsx           # Detailed Resilience4j Actuator Charts
│   │   ├── ServiceStatusCard.tsx     # Eureka Service Health Badge
│   │   ├── StatusBadge.tsx           # Status Indicator (UP / DOWN / UNKNOWN)
│   │   └── TracingCard.tsx           # Zipkin Distributed Tracing Status
│   ├── pages/
│   │   └── Dashboard.tsx             # Main Observability Dashboard Layout
│   ├── services/
│   │   └── api.ts                    # API Client, Polling, Zipkin & Warm-Up Logic
│   ├── types/
│   │   └── resilience.ts             # TypeScript Type Definitions
│   ├── App.tsx                       # Root Component
│   ├── main.tsx                      # Entry Point
│   └── index.css                     # Tailwind & Global Styles
├── vercel.json            # Vercel Proxy Rewrites Config
├── package.json           # Dependencies & Scripts
└── README.md              # Frontend Documentation
```

---

## ⚙️ Environment & Vercel Rewrites (`vercel.json`)

To route API requests seamlessly without CORS issues, `vercel.json` proxies frontend routes to the cloud-deployed microservices:

```json
{
  "trailingSlash": false,
  "rewrites": [
    {
      "source": "/gateway/product-service/(.*)",
      "destination": "https://circuitbreaker-product.onrender.com/$1"
    },
    {
      "source": "/gateway/inventory-service/(.*)",
      "destination": "https://circuitbreaker-inventory.onrender.com/$1"
    },
    {
      "source": "/gateway/recommendation-service/(.*)",
      "destination": "https://circuitbreaker-recommendation.onrender.com/$1"
    },
    {
      "source": "/gateway/(.*)",
      "destination": "https://circuitbreaker-gateway.onrender.com/$1"
    },
    {
      "source": "/eureka-api/(.*)",
      "destination": "https://circuitbreaker-eureka.onrender.com/eureka/$1"
    },
    {
      "source": "/zipkin/(.*)",
      "destination": "https://circuitbreaker-zipkin.onrender.com/$1"
    }
  ]
}
```

---

## 💻 Local Setup & Installation

### Prerequisites
* **Node.js**: v18+ 
* **npm**: v9+

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 3. Build for Production
```bash
npm run build
```

---

## 🌐 Live Production Deployment

* **Production URL**: [https://circuit-breaker-one.vercel.app/](https://circuit-breaker-one.vercel.app/)
