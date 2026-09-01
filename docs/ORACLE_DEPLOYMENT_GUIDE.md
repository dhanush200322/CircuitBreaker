# 🚀 CircuitBreaker — Oracle Cloud Always Free 24/7 Deployment Guide

> **Zero-Cost Production Runbook** for deploying the complete 6-container Spring Boot / Zipkin microservices architecture to an **Oracle Cloud Always Free ARM64 VM** with an encrypted, permanent **Cloudflare Named Tunnel** and **Vercel Frontend**.

---

## 📑 Table of Contents (Deployment Sequence)

1. [Step 1: Create Oracle Always Free ARM64 VM](#step-1-create-oracle-always-free-arm64-vm)
2. [Step 2: Verify the VM is Always Free Eligible](#step-2-verify-the-vm-is-always-free-eligible)
3. [Step 3: Configure Ubuntu](#step-3-configure-ubuntu)
4. [Step 4: Configure SSH](#step-4-configure-ssh)
5. [Step 5: Install Docker](#step-5-install-docker)
6. [Step 6: Clone GitHub Repository](#step-6-clone-github-repository)
7. [Step 7: Configure Production Environment](#step-7-configure-production-environment)
8. [Step 8: Create Cloudflare Named Tunnel](#step-8-create-cloudflare-named-tunnel)
9. [Step 9: Configure Tunnel Routes](#step-9-configure-tunnel-routes)
10. [Step 10: Start Production Docker Compose](#step-10-start-production-docker-compose)
11. [Step 11: Verify Containers](#step-11-verify-containers)
12. [Step 12: Verify Eureka](#step-12-verify-eureka)
13. [Step 13: Verify Gateway](#step-13-verify-gateway)
14. [Step 14: Verify Product](#step-14-verify-product)
15. [Step 15: Verify Inventory](#step-15-verify-inventory)
16. [Step 16: Verify Recommendation](#step-16-verify-recommendation)
17. [Step 17: Verify Resilience4j](#step-17-verify-resilience4j)
18. [Step 18: Verify Zipkin](#step-18-verify-zipkin)
19. [Step 19: Configure Vercel (ONLY After Backend Passes)](#step-19-configure-vercel-only-after-backend-passes)
20. [Step 20: Perform PC-OFF Test](#step-20-perform-pc-off-test)

---

## 🛡️ Zero-Cost Safety & Rules

> [!IMPORTANT]
> **Always Free Guarantees:**
> - **$0 / month FOREVER**: Oracle provides up to 4 OCPU and 24 GB RAM free across Ampere A1 instances.
> - **We use 2 OCPU / 12 GB RAM** as our strict planning limit.
> - **No Paid Database Required**: All services in this deployment are stateless and use in-memory state.
> - **No Paid Domain Required**: Cloudflare provides free subdomains (or you can use any free DNS/domain you own).
> - **Cloudflare Zero Trust Free Plan**: Supports up to 50 users for free with unlimited Named Tunnels.

> [!WARNING]
> If any configuration in the Oracle Cloud web console asks for paid addons, paid block volumes (>200GB), or non-Ampere compute shapes, abort immediately. Look for the grey **"Always Free Eligible"** badge on every screen.

---

## Step 1: Create Oracle Always Free ARM64 VM

1. Log in to your [Oracle Cloud Infrastructure (OCI) Console](https://cloud.oracle.com/).
2. Navigate to **Compute** → **Instances** → **Create Instance**.
3. Configure the following parameters:
   - **Name:** `circuitbreaker-prod-vm`
   - **Placement:** Any Availability Domain with Always Free capacity.
   - **Image:** Click **Change Image** → Select **Canonical Ubuntu** → **Ubuntu 22.04 LTS (aarch64 / ARM64)** or **Ubuntu 24.04 LTS (aarch64)**.
   - **Shape:** Click **Change Shape** → Choose **Ampere (ARM)** → **`VM.Standard.A1.Flex`**.
     - **OCPUs:** `2`
     - **Memory (GB):** `12`
   - **Networking:** Create new Virtual Cloud Network (VCN) with a Public Subnet and assign a public IPv4 address.
   - **SSH Keys:** Select **Generate a key pair for me** and click **Save Private Key** (saves as `ssh-key-*.key`), OR upload your own public key (`~/.ssh/id_rsa.pub`).
   - **Boot Volume:** Keep default (50 GB).

---

## Step 2: Verify the VM is Always Free Eligible

> ⚠️ PAYMENT RISK — VERIFY BEFORE CONTINUING

Before clicking **Create**, verify that the summary sidebar displays:
- Shape: `VM.Standard.A1.Flex`
- OCPU: `2`, RAM: `12 GB`
- Image: `Canonical Ubuntu (aarch64)`
- Badge visible: **`Always Free Eligible`**

Click **Create** and wait ~60 seconds until the instance status transitions to **RUNNING** (Green icon). Note down your instance's **Public IP Address** (e.g. `129.153.x.x`).

---

## Step 3: Configure Ubuntu

1. Open PowerShell / Terminal on your local machine.
2. Ensure file permissions on your downloaded private key (Windows PowerShell):
   ```powershell
   # Move key to your .ssh folder
   Move-Item "$HOME\Downloads\ssh-key-*.key" "$HOME\.ssh\oracle_arm.key"
   ```
3. Connect to the Oracle VM via SSH:
   ```bash
   ssh -i ~/.ssh/oracle_arm.key ubuntu@<YOUR_ORACLE_PUBLIC_IP>
   ```
4. Update the package repositories and upgrade existing packages:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

---

## Step 4: Configure SSH

1. (Optional but recommended) Configure keep-alive to prevent SSH session drops:
   ```bash
   sudo bash -c 'echo "ClientAliveInterval 60" >> /etc/ssh/sshd_config'
   sudo bash -c 'echo "ClientAliveCountMax 10" >> /etc/ssh/sshd_config'
   sudo systemctl restart ssh
   ```

---

## Step 5: Install Docker & Docker Compose

Install official Docker Engine and the Compose plugin on Ubuntu ARM64:

```bash
# 1. Install prerequisites
sudo apt install -y ca-certificates curl gnupg lsb-release

# 2. Add Docker official GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# 3. Add Docker ARM64 repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 4. Install Docker Engine and Docker Compose Plugin
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 5. Allow running docker without sudo
sudo usermod -aG docker $USER
newgrp docker

# 6. Verify Docker installation
docker --version
docker compose version
```

---

## Step 6: Clone GitHub Repository

```bash
cd ~
git clone https://github.com/dhanush200322/CircuitBreaker.git
cd CircuitBreaker
```

---

## Step 7: Configure Production Environment

1. Copy the production environment template:
   ```bash
   cp .env.production.example .env.production
   ```
2. We will fill `TUNNEL_TOKEN` in the next step.

---

## Step 8: Create Cloudflare Named Tunnel

A Cloudflare Named Tunnel gives you a **permanent HTTPS ingress** without opening any inbound firewall ports on Oracle Cloud!

1. Go to the [Cloudflare Zero Trust Dashboard](https://one.dash.cloudflare.com/).
2. In the left navigation, click **Networks** → **Tunnels**.
3. Click **Add a tunnel** → Choose **Cloudflare Tunnel (cloudflared)** → Click **Next**.
4. **Tunnel Name:** Enter `circuitbreaker-prod-tunnel` → Click **Save tunnel**.
5. Under **Choose your environment**, select **Docker**.
6. Cloudflare displays a command containing your token:
   ```bash
   docker run cloudflare/cloudflared:latest tunnel --no-autoupdate run --token eyJhIjoi...
   ```
7. Copy the token string (the part after `--token`).
8. On your Oracle VM, open `.env.production`:
   ```bash
   nano .env.production
   ```
   Paste your token:
   ```env
   TUNNEL_TOKEN=eyJhIjoi...YOUR_COPIED_TOKEN...
   ```
   Save and exit (`Ctrl + O`, `Enter`, `Ctrl + X`).

---

## Step 9: Configure Tunnel Public Hostname Routes

In the Cloudflare Zero Trust Tunnel setup page, go to the **Public Hostname** tab and add the following 3 ingress rules:

| Path / Subdomain | Service Type | Service URL (Docker DNS) | Notes |
| :--- | :--- | :--- | :--- |
| `api.yourdomain.com` (or Path `/gateway/*`) | `HTTP` | `api-gateway:8084` | Ingress for API Gateway routing |
| `eureka.yourdomain.com` (or Path `/eureka-api/*`) | `HTTP` | `service-registry:8080` | Ingress for Eureka registry dashboard & API |
| `zipkin.yourdomain.com` (or Path `/zipkin/*`) | `HTTP` | `zipkin:9411` | Ingress for OpenZipkin distributed tracing |

> [!TIP]
> **Single Domain Path-Based Alternative (Recommended for Vercel):**
> If using a single hostname (e.g. `cb-backend.yourdomain.com`):
> - Rule 1: Path `gateway/*` → `HTTP` `api-gateway:8084`
> - Rule 2: Path `eureka/*` → `HTTP` `service-registry:8080`
> - Rule 3: Path `zipkin/*` → `HTTP` `zipkin:9411`
> - Rule 4 (Catch-all): `HTTP` `api-gateway:8084`

Click **Save hostname**.

---

## Step 10: Start Production Docker Compose

Build the ARM64 container images and launch the 7-service production stack in detached mode:

```bash
cd ~/CircuitBreaker
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
```

*(The initial build takes ~2-3 minutes to download dependencies and compile all 5 Spring Boot JARs on the ARM64 builder stage).*

---

## Step 11: Verify Containers

Check the health status of all 7 containers:

```bash
docker compose -f docker-compose.prod.yml ps
```

**Expected Output:**
```text
NAME                        IMAGE                                     STATUS                    PORTS
cb-api-gateway              circuitbreaker-api-gateway:prod           Up (healthy)              8084/tcp
cb-cloudflared              cloudflare/cloudflared:latest             Up                        
cb-inventory-service        circuitbreaker-inventory-service:prod     Up (healthy)              8082/tcp
cb-product-service          circuitbreaker-product-service:prod       Up (healthy)              8081/tcp
cb-recommendation-service   circuitbreaker-recommendation-service:prod Up (healthy)             8083/tcp
cb-service-registry         circuitbreaker-service-registry:prod      Up (healthy)              8080/tcp
cb-zipkin                   openzipkin/zipkin:latest                  Up (healthy)              9411/tcp
```

---

## Step 12: Verify Eureka

Test Eureka service discovery inside the Oracle VM:

```bash
docker exec -it cb-api-gateway wget -q -O - http://service-registry:8080/eureka/apps
```

Verify that all 4 Spring Boot clients are registered:
- `PRODUCT-SERVICE`
- `INVENTORY-SERVICE`
- `RECOMMENDATION-SERVICE`
- `API-GATEWAY`

---

## Step 13: Verify Gateway

Test internal Gateway routing to downstream microservices:

```bash
docker exec -it cb-api-gateway wget -q -O - http://localhost:8084/actuator/health
```
*(Should return `{"status":"UP"}`)*

---

## Step 14: Verify Product Service

```bash
docker exec -it cb-api-gateway wget -q -O - http://localhost:8084/product-service/products
```
*(Should return `HTTP 200` with the JSON list of products)*

---

## Step 15: Verify Inventory Service

```bash
docker exec -it cb-api-gateway wget -q -O - http://localhost:8084/inventory-service/inventory/1
```
*(Should return `HTTP 200` with product #1 stock status)*

---

## Step 16: Verify Recommendation Service

```bash
docker exec -it cb-api-gateway wget -q -O - http://localhost:8084/recommendation-service/recommendations/1
```
*(Should return `HTTP 200` with normal recommendations list)*

---

## Step 17: Verify Resilience4j Circuit Breaker & Chaos

1. Test simulated exception fallback:
   ```bash
   docker exec -it cb-api-gateway wget -q -O - "http://localhost:8084/recommendation-service/recommendations/1?fail=true"
   ```
   *(Should return fallback recommendations with status `HTTP 200`)*

2. Test simulated latency timeout & retry:
   ```bash
   docker exec -it cb-api-gateway wget -q -O - "http://localhost:8084/recommendation-service/recommendations/1?delay=3000"
   ```

3. Check Circuit Breaker metrics:
   ```bash
   docker exec -it cb-api-gateway wget -q -O - "http://recommendation-service:8083/actuator/metrics/resilience4j.circuitbreaker.state?tag=name:recommendationService"
   ```

---

## Step 18: Verify Zipkin Distributed Tracing

```bash
docker exec -it cb-api-gateway wget -q -O - http://zipkin:9411/api/v2/services
```
*(Should return `["api-gateway","inventory-service","product-service","recommendation-service"]`)*

---

## Step 19: Configure Vercel (ONLY After All Backend Tests Pass)

Now that your Oracle Cloud backend is verified healthy 24/7, update `circuitbreaker-frontend/vercel.json` **once** with your permanent Cloudflare Named Tunnel endpoints:

```json
{
  "trailingSlash": false,
  "rewrites": [
    {
      "source": "/gateway/:path*",
      "destination": "https://<PERMANENT-TUNNEL-DOMAIN>/gateway/:path*"
    },
    {
      "source": "/eureka-api/:path*",
      "destination": "https://<PERMANENT-TUNNEL-DOMAIN>/eureka/:path*"
    },
    {
      "source": "/zipkin",
      "destination": "https://<PERMANENT-TUNNEL-DOMAIN>/zipkin/"
    },
    {
      "source": "/zipkin/",
      "destination": "https://<PERMANENT-TUNNEL-DOMAIN>/zipkin/"
    },
    {
      "source": "/zipkin/:path+",
      "destination": "https://<PERMANENT-TUNNEL-DOMAIN>/zipkin/:path+"
    }
  ]
}
```

Deploy to Vercel:
```bash
git add circuitbreaker-frontend/vercel.json
git commit -m "feat(deploy): connect frontend to 24/7 Oracle Cloud backend"
git push origin main
```

---

## Step 20: Perform the PC-OFF Test 🎉

1. Close all PowerShell terminals on your Windows PC.
2. Stop Docker Desktop on your Windows PC (or completely power off your PC).
3. Open your live dashboard on your mobile phone or any other device:  
   👉 **[https://circuit-breaker-one.vercel.app/](https://circuit-breaker-one.vercel.app/)**
4. Verify that:
   - Service cards show green **HEALTHY** status.
   - Actuator metrics load in real-time.
   - Triggering Chaos / Fault Injection experiments works instantly.
   - Zipkin traces render seamlessly.

**Your CircuitBreaker platform is now permanently online 24/7/365 at zero cost!**
