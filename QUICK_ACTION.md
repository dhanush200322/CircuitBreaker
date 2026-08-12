# ⚡ QUICK_ACTION.md — Cold Start & Resume Guide (PC-Restart / Terminals-Closed)

> **Use this guide whenever your PC was powered off, terminals were closed, or Docker was restarted, and you need to bring the live portfolio demo back online in under 2 minutes.**

---

## 🎯 The Cold-Start Workflow at a Glance

```text
[PC Turned ON]
     │
     ├─► Step 1: Open Docker Desktop
     │
     ├─► Step 2: Run Docker Compose Stack (Terminal 1)
     │
     ├─► Step 3: Launch 3 Cloudflare Ingress Tunnels (Terminals 2, 3, 4)
     │
     ├─► Step 4: Paste the 3 new URLs into circuitbreaker-frontend/vercel.json
     │
     ├─► Step 5: Git Push to Vercel (Terminal 1)
     │
     └─► Step 6: Run Automated Smoke Test & Open Live Dashboard!
```

---

## 🟢 STEP 1: Launch Docker Desktop
Make sure **Docker Desktop** is running on your Windows PC (look for the whale icon in the system tray).

---

## 🟢 STEP 2: Start the Java Backend Containers (Terminal 1)

Open **PowerShell Window #1** as Administrator or normal user, and run:

```powershell
cd C:\Users\ro224\OneDrive\Desktop\CircuitBreaker
docker compose up -d
```

Verify that all 6 services are up:
```powershell
docker compose ps
```

---

## 🟢 STEP 3: Launch the 3 Cloudflare Ingress Tunnels (Terminals 2, 3, 4)

Because Cloudflare Quick Tunnels are ephemeral, every time you close them and reopen, they assign new HTTPS URLs. 

Open **3 separate PowerShell windows** and run one command in each:

### 🔹 Terminal #2 — API Gateway Ingress (:8084)
```powershell
cloudflared tunnel --url http://localhost:8084
```
*(Look for the line: `Your quick Tunnel has been created! Visit it at: https://<gateway-subdomain>.trycloudflare.com`)*

---

### 🔹 Terminal #3 — Eureka Service Registry Ingress (:8080)
```powershell
cloudflared tunnel --url http://localhost:8080
```
*(Look for the line: `Your quick Tunnel has been created! Visit it at: https://<eureka-subdomain>.trycloudflare.com`)*

---

### 🔹 Terminal #4 — Zipkin Distributed Tracing Ingress (:9411)
```powershell
cloudflared tunnel --url http://localhost:9411
```
*(Look for the line: `Your quick Tunnel has been created! Visit it at: https://<zipkin-subdomain>.trycloudflare.com`)*

> [!IMPORTANT]
> **Keep Terminals #2, #3, and #4 running!** Do not close them while presenting or testing.

---

## 🟢 STEP 4: Update `circuitbreaker-frontend/vercel.json`

Open `circuitbreaker-frontend/vercel.json` in your editor and replace the destination URLs with the 3 new ones you just got from Terminals 2, 3, and 4:

```json
{
  "trailingSlash": false,
  "rewrites": [
    {
      "source": "/gateway/:path*",
      "destination": "https://<GATEWAY-SUBDOMAIN>.trycloudflare.com/:path*"
    },
    {
      "source": "/eureka-api/:path*",
      "destination": "https://<EUREKA-SUBDOMAIN>.trycloudflare.com/eureka/:path*"
    },
    {
      "source": "/zipkin",
      "destination": "https://<ZIPKIN-SUBDOMAIN>.trycloudflare.com/zipkin/"
    },
    {
      "source": "/zipkin/",
      "destination": "https://<ZIPKIN-SUBDOMAIN>.trycloudflare.com/zipkin/"
    },
    {
      "source": "/zipkin/:path+",
      "destination": "https://<ZIPKIN-SUBDOMAIN>.trycloudflare.com/zipkin/:path+"
    }
  ]
}
```

---

## 🟢 STEP 5: Push to GitHub to Auto-Deploy on Vercel

In **Terminal #1** (or any available terminal), deploy the updated routing:

```powershell
cd C:\Users\ro224\OneDrive\Desktop\CircuitBreaker
git add circuitbreaker-frontend/vercel.json
git commit -m "chore: update live Cloudflare tunnel endpoints"
git push origin main
```

*(Wait ~20 seconds for Vercel to automatically rebuild and deploy the new routing).*

---

## 🟢 STEP 6: Run Quick Smoke Test & Open Live Dashboard

Run this 1-click test in PowerShell to verify everything is responding with **HTTP 200**:

```powershell
Write-Host "--- Testing Live Vercel Production Endpoints ---" -ForegroundColor Cyan
curl.exe -s -i "https://circuit-breaker-one.vercel.app/gateway/product-service/products" | Select-String "HTTP/1.1"
curl.exe -s -i "https://circuit-breaker-one.vercel.app/gateway/inventory-service/inventory/1" | Select-String "HTTP/1.1"
curl.exe -s -i "https://circuit-breaker-one.vercel.app/gateway/recommendation-service/recommendations/1" | Select-String "HTTP/1.1"
curl.exe -s -i -H "Accept: application/json" "https://circuit-breaker-one.vercel.app/eureka-api/apps" | Select-String "HTTP/1.1"
curl.exe -s -i "https://circuit-breaker-one.vercel.app/zipkin/api/v2/services" | Select-String "HTTP/1.1"
```

🎉 **Open your live production dashboard:**
👉 **[https://circuit-breaker-one.vercel.app/](https://circuit-breaker-one.vercel.app/)**

---

## 🛑 When You Are Done: Shutdown / Teardown

When you want to shut everything down before turning off your PC:

1. In Terminals #2, #3, and #4: Press `Ctrl + C` to stop the Cloudflare tunnels.
2. In Terminal #1, stop the backend containers:
```powershell
cd C:\Users\ro224\OneDrive\Desktop\CircuitBreaker
docker compose down
```
3. (Optional) Kill any remaining background processes:
```powershell
Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue | Stop-Process -Force
```
