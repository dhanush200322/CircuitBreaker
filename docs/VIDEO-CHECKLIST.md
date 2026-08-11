# CircuitBreaker — Video Recording & QA Checklist

Use this checklist before, during, and after recording your 3–5 minute demonstration video.

---

## 1. Pre-Recording Preparation

### A. Environment & Backend Infrastructure
- [ ] Docker Compose is running locally:
  ```powershell
  docker compose ps
  ```
- [ ] All 6 containers are in `Up` (healthy) state:
  - [ ] `service-registry` (`8080:8080`)
  - [ ] `api-gateway` (`8084:8084`)
  - [ ] `product-service` (`8081:8081`)
  - [ ] `inventory-service` (`8082:8082`)
  - [ ] `recommendation-service` (`8083:8083`)
  - [ ] `zipkin` (`9411:9411`)

### B. Cloudflare Quick Tunnels
- [ ] Terminal 1: API Gateway tunnel running (`cloudflared tunnel --url http://localhost:8084`)
- [ ] Terminal 2: Eureka Registry tunnel running (`cloudflared tunnel --url http://localhost:8080`)
- [ ] Terminal 3: Zipkin Tracing tunnel running (`cloudflared tunnel --url http://localhost:9411`)
- [ ] Verified `vercel.json` has current tunnel URLs and Vercel build is synchronized with remote `main`.

### C. Live Production Sanity Check
- [ ] Open [https://circuit-breaker-one.vercel.app/](https://circuit-breaker-one.vercel.app/)
- [ ] Header displays pulsing **SYSTEM HEALTHY** badge.
- [ ] Banner displays **LIVE OBSERVABILITY ACTIVE**.
- [ ] All 5 microservices show green **UP** badges.
- [ ] Zipkin Tracing shows **UP** with 4 traced services.
- [ ] Circuit Breaker shows **CLOSED**.
- [ ] Resilience Metrics show live numerical counts (not `--` or `UNKNOWN`).
- [ ] Click **Normal Request** → Verify HTTP 200 and Trace Summary.
- [ ] Click **Trigger Failure** → Verify Fallback banner and incremented failure metrics.
- [ ] Click **Trigger Latency** → Verify timeout delay and incremented timeout metrics.

### D. Audio & Display Setup
- [ ] Microphone tested for clear audio levels with minimal background noise.
- [ ] Screen resolution set to 1080p (1920x1080) or clean 16:9 ratio.
- [ ] Browser zoom set to 100% or 110% for optimal card readability.
- [ ] Close unnecessary browser tabs, personal bookmarks, and notification banners.
- [ ] Hide sensitive terminal windows or personal credential files.

---

## 2. During Recording Flow

Follow the sequence from [`docs/VIDEO-DEMO-SCRIPT.md`](VIDEO-DEMO-SCRIPT.md):

- [ ] **[0:00 - 0:20] Section 1: Intro**
  - Show GitHub repository / Project title.
  - Deliver natural 15-second opening pitch.
- [ ] **[0:20 - 0:50] Section 2: Architecture**
  - Show README ASCII architecture diagram.
  - Trace request flow: Vercel → Cloudflare → Gateway → Eureka → Microservices → Zipkin.
- [ ] **[0:50 - 1:20] Section 3: Live Dashboard**
  - Navigate to live Vercel URL.
  - Point out System Healthy badge, 5 UP service cards, Zipkin status, and live Actuator metrics.
- [ ] **[1:20 - 1:50] Section 4: Normal Request**
  - Click 'Normal Request'.
  - Point out HTTP 200 response, accessory recommendations, and generated Trace ID.
- [ ] **[1:50 - 2:40] Section 5: Failure & Circuit Breaker**
  - Click 'Trigger Failure'.
  - Point out Graceful Fallback alert banner, degraded JSON output, and incremented Failed/Retry metrics.
- [ ] **[2:40 - 3:15] Section 6: Latency & TimeLimiter**
  - Click 'Trigger Latency'.
  - Point out 2s timeout window enforcement, timeout metrics increment, and thread pool protection.
- [ ] **[3:15 - 3:50] Section 7: Distributed Tracing in Zipkin**
  - Click 'Open Zipkin' button.
  - Query recent traces and show parent-child waterfall spans between Gateway and Recommendation Service.
- [ ] **[3:50 - 4:10] Section 8: Dynamic Eureka Discovery**
  - Explain client-side load balancing and dynamic registration without hardcoded IPs.
- [ ] **[4:10 - 4:30] Section 9: Summary & Conclusion**
  - Return to dashboard, summarize resilience benefits, and conclude professionally.

---

## 3. Post-Recording Review & Finalization

- [ ] **Audio Quality**: Ensure voice is clear and synchronized with video.
- [ ] **Privacy & Security Check**:
  - [ ] No API keys or tokens displayed.
  - [ ] No database passwords or system credentials visible.
  - [ ] No personal emails or private directories exposed.
- [ ] **Editing**:
  - [ ] Trim any awkward pauses or dead air at the beginning/end.
  - [ ] Cut long network lag if necessary (keep latency demonstration authentic).
- [ ] **Export**:
  - [ ] Format: MP4 (H.264 / AAC)
  - [ ] Resolution: 1080p (60fps or 30fps)
- [ ] **Publishing**:
  - [ ] Upload to YouTube (Unlisted or Public) / Loom / Google Drive.
  - [ ] Update `README.md` placeholder `[Watch the full project demonstration](VIDEO_LINK_HERE)` with the actual link.
