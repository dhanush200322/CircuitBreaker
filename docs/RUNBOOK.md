# 📋 CircuitBreaker — Complete Copy-and-Paste Commands Runbook

This document contains **every single terminal command** required to run, expose, and test the entire **CircuitBreaker Microservices Platform**. 

Every block is pre-formatted for direct 1-click **"Copy Code"** execution in PowerShell or Command Prompt.

---

## 📑 Quick Navigation
1. [Option A: 5 Java Services (Native Terminal Execution)](#-1-option-a-5-java-services-native-terminal-execution)
2. [Option B: 1-Click Docker Compose Execution](#-2-option-b-1-click-docker-compose-execution)
3. [Cloudflare Quick Tunnel Ingress Commands](#-3-cloudflare-quick-tunnel-ingress-commands)
4. [React Frontend Execution Commands](#-4-react-frontend-execution-commands)
5. [Production Testing Commands (Live Vercel Edge)](#-5-production-testing-commands-live-vercel-edge)
6. [Local Testing Commands (Localhost Direct)](#-6-local-testing-commands-localhost-direct)
7. [Resilience4j & Chaos Verification Commands](#-7-resilience4j--chaos-verification-commands)
8. [Troubleshooting, Logs & Diagnostic Commands](#-8-troubleshooting-logs--diagnostic-commands)
9. [Teardown & Process Cleanup Commands](#-9-teardown--process-cleanup-commands)
10. [All-In-One Automated Test Script](#-10-all-in-one-automated-test-script)

---

## ☕ 1. Option A: 5 Java Services (Native Terminal Execution)

If running directly on your host machine without Docker Compose, open separate PowerShell windows and run in this strict numerical order:

### 🔹 Terminal 1: Build All Microservices (Run First)
```powershell
cd C:\Users\ro224\OneDrive\Desktop\CircuitBreaker\circuitbreaker-backend
mvn clean package -DskipTests
```

### 🔹 Terminal 2: Zipkin Tracing Server (Port 9411)
```powershell
docker run -d -p 9411:9411 --name zipkin openzipkin/zipkin
```

### 🔹 Terminal 3: Service Registry / Eureka (Port 8080)
> *(Wait 10 seconds for Eureka to initialize before starting microservices below)*
```powershell
cd C:\Users\ro224\OneDrive\Desktop\CircuitBreaker\circuitbreaker-backend
java -jar service-registry/target/service-registry-1.0-SNAPSHOT.jar
```

### 🔹 Terminal 4: Product Service (Port 8081)
```powershell
cd C:\Users\ro224\OneDrive\Desktop\CircuitBreaker\circuitbreaker-backend
java -jar product-service/target/product-service-1.0-SNAPSHOT.jar
```

### 🔹 Terminal 5: Inventory Service (Port 8082)
```powershell
cd C:\Users\ro224\OneDrive\Desktop\CircuitBreaker\circuitbreaker-backend
java -jar inventory-service/target/inventory-service-1.0-SNAPSHOT.jar
```

### 🔹 Terminal 6: Recommendation Service + Resilience4j (Port 8083)
```powershell
cd C:\Users\ro224\OneDrive\Desktop\CircuitBreaker\circuitbreaker-backend
java -jar recommendation-service/target/recommendation-service-1.0-SNAPSHOT.jar
```

### 🔹 Terminal 7: Spring Cloud API Gateway (Port 8084)
> *(Start this last after all other services have registered with Eureka)*
```powershell
cd C:\Users\ro224\OneDrive\Desktop\CircuitBreaker\circuitbreaker-backend
java -jar api-gateway/target/api-gateway-1.0-SNAPSHOT.jar
```

---

## 🐳 2. Option B: 1-Click Docker Compose Execution

If you prefer running everything in containerized isolation, use these commands from the project root:

### Start Complete Backend Stack in Background
```powershell
cd C:\Users\ro224\OneDrive\Desktop\CircuitBreaker
docker compose up --build -d
```

### Check Container Status
```powershell
docker compose ps
```

### Stream Aggregated Live Logs
```powershell
docker compose logs -f
```

---

## 🌐 3. Cloudflare Quick Tunnel Ingress Commands

To connect your local running backend to the live Vercel frontend for zero cost, run these in **3 separate PowerShell windows** and keep them open:

### 🟢 Tunnel Window 1: API Gateway (Port 8084)
```powershell
cloudflared tunnel --url http://localhost:8084
```

### 🟢 Tunnel Window 2: Eureka Service Registry (Port 8080)
```powershell
cloudflared tunnel --url http://localhost:8080
```

### 🟢 Tunnel Window 3: Zipkin Tracing Server (Port 9411)
```powershell
cloudflared tunnel --url http://localhost:9411
```

### 🟢 Deploy New Tunnel URLs to Vercel (After updating `vercel.json`)
```powershell
cd C:\Users\ro224\OneDrive\Desktop\CircuitBreaker
git add circuitbreaker-frontend/vercel.json
git commit -m "chore: update live Cloudflare tunnel endpoints"
git push origin main
```

---

## ⚛️ 4. React Frontend Execution Commands

### Run Frontend Locally on Port 5173
```powershell
cd C:\Users\ro224\OneDrive\Desktop\CircuitBreaker\circuitbreaker-frontend
npm install
npm run dev
```

---

## 🚀 5. Production Testing Commands (Live Vercel Edge)

Run these commands in PowerShell to test against the live production deployment:

### 1. Test Gateway Product Catalog
```powershell
curl.exe -i "https://circuit-breaker-one.vercel.app/gateway/product-service/products"
```

### 2. Test Gateway Inventory Service
```powershell
curl.exe -i "https://circuit-breaker-one.vercel.app/gateway/inventory-service/inventory/1"
```

### 3. Test Recommendation Service (Happy Path)
```powershell
curl.exe -i "https://circuit-breaker-one.vercel.app/gateway/recommendation-service/recommendations/1"
```

### 4. Test Chaos Failure & Fallback (`fail=true`)
```powershell
curl.exe -i "https://circuit-breaker-one.vercel.app/gateway/recommendation-service/recommendations/1?fail=true"
```

### 5. Test Chaos Latency & TimeLimiter Timeout (`delay=3000`)
```powershell
curl.exe -i "https://circuit-breaker-one.vercel.app/gateway/recommendation-service/recommendations/1?delay=3000"
```

### 6. Test Live Resilience4j Call Metrics
```powershell
curl.exe -i "https://circuit-breaker-one.vercel.app/gateway/recommendation-service/actuator/metrics/resilience4j.circuitbreaker.calls?tag=name:recommendationService"
```

### 7. Test Eureka Service Registry Applications
```powershell
curl.exe -i -H "Accept: application/json" "https://circuit-breaker-one.vercel.app/eureka-api/apps"
```

### 8. Test Zipkin Registered Traced Services
```powershell
curl.exe -i "https://circuit-breaker-one.vercel.app/zipkin/api/v2/services"
```

### 9. Test Zipkin Distributed Trace Waterfalls
```powershell
curl.exe -i "https://circuit-breaker-one.vercel.app/zipkin/api/v2/traces?serviceName=api-gateway&limit=5"
```

---

## 💻 6. Local Testing Commands (Localhost Direct)

Run these commands in PowerShell to test against your local containerized ports:

### 1. Test Local Product Catalog (:8084)
```powershell
curl.exe -i "http://localhost:8084/product-service/products"
```

### 2. Test Local Inventory Service (:8084)
```powershell
curl.exe -i "http://localhost:8084/inventory-service/inventory/1"
```

### 3. Test Local Recommendation Service (:8084)
```powershell
curl.exe -i "http://localhost:8084/recommendation-service/recommendations/1"
```

### 4. Test Local Eureka Direct (:8080)
```powershell
curl.exe -i -H "Accept: application/json" "http://localhost:8080/eureka/apps"
```

### 5. Test Local Zipkin Direct (:9411)
```powershell
curl.exe -i "http://localhost:9411/api/v2/services"
```

---

## ⚡ 7. Resilience4j & Chaos Verification Commands

### 1. Burst Test: Trip Circuit Breaker (CLOSED → OPEN)
```powershell
1..5 | ForEach-Object {
    Write-Host "Triggering Chaos Failure Request #$_..."
    curl.exe -s -i "https://circuit-breaker-one.vercel.app/gateway/recommendation-service/recommendations/1?fail=true" | Select-String "HTTP/1.1|recommendations"
    Start-Sleep -Milliseconds 200
}
```

### 2. Check Circuit Breaker State (0=CLOSED, 1=OPEN, 2=HALF_OPEN)
```powershell
curl.exe -s "https://circuit-breaker-one.vercel.app/gateway/recommendation-service/actuator/metrics/resilience4j.circuitbreaker.state?tag=name:recommendationService"
```

### 3. Check Successful Calls Count
```powershell
curl.exe -s "https://circuit-breaker-one.vercel.app/gateway/recommendation-service/actuator/metrics/resilience4j.circuitbreaker.calls?tag=name:recommendationService&tag=kind:successful"
```

### 4. Check Failed Calls Count
```powershell
curl.exe -s "https://circuit-breaker-one.vercel.app/gateway/recommendation-service/actuator/metrics/resilience4j.circuitbreaker.calls?tag=name:recommendationService&tag=kind:failed"
```

### 5. Check TimeLimiter Timeout Execution Metrics
```powershell
curl.exe -s "https://circuit-breaker-one.vercel.app/gateway/recommendation-service/actuator/metrics/resilience4j.timelimiter.calls?tag=name:recommendationService"
```

---

## 🔍 8. Troubleshooting, Logs & Diagnostic Commands

### View Logs for Specific Containers
```powershell
# API Gateway Logs
docker compose logs --tail=100 -f api-gateway

# Eureka Service Registry Logs
docker compose logs --tail=100 -f service-registry

# Recommendation Service Logs
docker compose logs --tail=100 -f recommendation-service

# Product Service Logs
docker compose logs --tail=100 -f product-service

# Inventory Service Logs
docker compose logs --tail=100 -f inventory-service

# Zipkin Logs
docker compose logs --tail=100 -f zipkin
```

### Restart a Single Microservice
```powershell
docker compose restart recommendation-service
docker compose restart api-gateway
```

### Check Active Port Listening State on Windows
```powershell
netstat -ano | findstr "8080 8081 8082 8083 8084 9411"
```

---

## 🧹 9. Teardown & Process Cleanup Commands

### Stop All Containers
```powershell
cd C:\Users\ro224\OneDrive\Desktop\CircuitBreaker
docker compose down
```

### Hard Reset (Wipe Containers, Networks, and Volumes)
```powershell
cd C:\Users\ro224\OneDrive\Desktop\CircuitBreaker
docker compose down --remove-orphans -v
```

### Terminate Any Hanging Cloudflare Tunnel Processes on Windows
```powershell
Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue | Stop-Process -Force
```

---

## 🚀 10. All-In-One Automated Test Script

Copy and paste this entire block into PowerShell to test all live production endpoints in one single execution:

```powershell
Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host "CIRCUITBREAKER PRODUCTION HEALTH SWEEP" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

$base = "https://circuit-breaker-one.vercel.app"

function Run-Test ($name, $url) {
    Write-Host "`n--> Testing: $name" -ForegroundColor Yellow
    Write-Host "URL: $url" -ForegroundColor DarkGray
    try {
        $res = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 10
        Write-Host "Result: HTTP $($res.StatusCode) OK" -ForegroundColor Green
        Write-Host "Payload: $(($res.Content | Out-String).Trim().Substring(0, [Math]::Min(140, $res.Content.Length)))..." -ForegroundColor Gray
    } catch {
        Write-Host "Result: FAILED - $_" -ForegroundColor Red
    }
}

Run-Test "1. Gateway Product Service" "$base/gateway/product-service/products"
Run-Test "2. Gateway Inventory Service" "$base/gateway/inventory-service/inventory/1"
Run-Test "3. Gateway Recommendation (Happy Path)" "$base/gateway/recommendation-service/recommendations/1"
Run-Test "4. Chaos Failure & Fallback" "$base/gateway/recommendation-service/recommendations/1?fail=true"
Run-Test "5. Chaos Latency & TimeLimiter" "$base/gateway/recommendation-service/recommendations/1?delay=3000"
Run-Test "6. Resilience4j Live Metrics" "$base/gateway/recommendation-service/actuator/metrics/resilience4j.circuitbreaker.calls?tag=name:recommendationService"
Run-Test "7. Eureka Service Registry" "$base/eureka-api/apps"
Run-Test "8. Zipkin Traced Services" "$base/zipkin/api/v2/services"
Run-Test "9. Zipkin Trace Waterfalls" "$base/zipkin/api/v2/traces?serviceName=api-gateway&limit=1"

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host "HEALTH SWEEP COMPLETE" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
```
