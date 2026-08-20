# 🚀 K8s Todo App — Learning Journal

A full-stack **Todo application** (React + Node.js + MongoDB) used as a hands-on playground for learning **Docker** and **Kubernetes** concepts from scratch.

---

## 📚 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [What We Learned](#3-what-we-learned)
4. [Scenarios We Practiced](#4-scenarios-we-practiced)
5. [Docker Compose Explained](#5-docker-compose-explained-line-by-line)
6. [Kubernetes YAML Files Explained](#6-kubernetes-yaml-files-explained)
   - [PersistentVolumeClaim — mongodb-pvc.yaml](#61-persistentvolumeclaim--mongodb-pvcyaml)
   - [MongoDB — mongodb.yaml](#62-mongodb--mongodbyaml)
   - [Backend Deployment — backend-deployment.yaml](#63-backend-deployment--backend-deploymentyaml)
   - [Backend Service — backend-service.yaml](#64-backend-service--backend-serviceyaml)
   - [Frontend Deployment — frontend-deployment.yaml](#65-frontend-deployment--frontend-deploymentyaml)
   - [Frontend Service — frontend-service.yaml](#66-frontend-service--frontend-serviceyaml)
   - [Ingress — ingress.yaml](#67-ingress--ingressyaml)
7. [Quick Command Reference](#7-quick-command-reference)
8. [What to Practice Next](#8-what-to-practice-next)

---

## 1. Project Overview

| Layer     | Technology          | Purpose                            |
|-----------|---------------------|------------------------------------|
| Frontend  | React + Vite        | UI served by Nginx                 |
| Backend   | Node.js + Express   | REST API (`/api/todos`, `/api/health`) |
| Database  | MongoDB 8           | Persistent task storage            |
| Container | Docker / Docker Compose | Local development              |
| Orchestration | Kubernetes (Minikube) | Production-like deployment   |

---

## 2. Architecture

```
Browser
   │
   ▼
[ Ingress (nginx) ]   ← todo.app.com
   │
   ├──/api/*──────► [Backend Service:5000] ──► [Backend Pod × 2] ──► [MongoDB Service:27017] ──► [MongoDB Pod × 1]
   │                                                                                                      │
   └──/──────────► [Frontend Service:80]  ──► [Frontend Pod × 2]                              [PVC: 5Gi]
```

**Traffic flow:**
1. User opens `todo.app.com` → Ingress routes `/` to the Frontend
2. Frontend's React app calls `/api/todos` → Ingress routes to Backend
3. Backend queries MongoDB using the internal DNS name `mongodb:27017`
4. MongoDB data is persisted in a PersistentVolumeClaim (survives pod restarts)

---

## 3. What We Learned

### 🐳 Docker Concepts

| Concept | What It Means |
|---|---|
| **Image** | A read-only snapshot of your app + all its dependencies |
| **Container** | A running instance of an image |
| **Dockerfile** | Instructions to build an image layer by layer |
| **Docker Compose** | Run multiple containers together with one command |
| **Volume** | Persistent storage that outlives a container |
| **Network** | Private channel so containers talk to each other by name |
| **`depends_on`** | Start order hint (does NOT wait for health, just start) |
| **`restart: unless-stopped`** | Auto-restarts crashed containers |

### ☸️ Kubernetes Concepts

| Concept | What It Means |
|---|---|
| **Pod** | The smallest unit — one or more containers running together |
| **Deployment** | Manages pods: how many replicas, rolling updates, restarts |
| **ReplicaSet** | Created by Deployment; keeps N pod copies alive |
| **Service** | Stable network endpoint (DNS name) that points to pods |
| **ClusterIP** | Internal-only service; accessible only inside the cluster |
| **Ingress** | External HTTP router; maps paths/hosts to services |
| **PersistentVolumeClaim (PVC)** | A "storage request" that survives pod restarts |
| **Labels & Selectors** | Key-value tags used to connect Deployments ↔ Services |
| **Resource Requests** | Minimum CPU/memory a pod needs (used for scheduling) |
| **Resource Limits** | Maximum CPU/memory a pod is allowed to use |
| **Probes** | Health checks Kubernetes runs to decide if a pod is healthy |
| **`imagePullPolicy: IfNotPresent`** | Use local image if it exists; don't pull from registry |

### 🔬 Probe Types We Used

| Probe | When It Runs | Purpose |
|---|---|---|
| **startupProbe** | Only at startup | Gives slow apps extra time to boot before other probes begin |
| **readinessProbe** | Continuously | Marks pod as "ready to receive traffic" — removes from load balancer if failing |
| **livenessProbe** | Continuously | If failing, Kubernetes **kills and restarts** the pod |

---

## 4. Scenarios We Practiced

### ✅ Scenario 1 — Local Dev with Docker Compose
**Goal:** Run all three services locally with one command.
```bash
docker compose up --build
```
- All services communicate via a shared `todo-net` bridge network
- Frontend available at `http://localhost:3000`

---

### ✅ Scenario 2 — Build Docker Images for Minikube
**Goal:** Build images directly into Minikube's Docker daemon so Kubernetes can use them without a registry.
```bash
eval $(minikube docker-env)
docker build -t k8s-todo-backend:v5 ./backend
docker build -t k8s-todo-frontend:v3 ./frontend
```
- `imagePullPolicy: IfNotPresent` was essential here to prevent Kubernetes from trying to pull non-existent remote images

---

### ✅ Scenario 3 — Deploy to Kubernetes
**Goal:** Apply all manifests in the correct order.
```bash
kubectl apply -f k8s/mongodb-pvc.yaml
kubectl apply -f k8s/mongodb.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml
kubectl apply -f k8s/ingress.yaml
```

---

### ✅ Scenario 4 — Probe Behavior Testing
**Goal:** Understand how probes protect production traffic.

The backend has a `/api/crash` endpoint that intentionally kills the process:
```bash
curl http://todo.app.com/api/crash
```
- Pod crashes → `livenessProbe` detects it → Kubernetes restarts the pod automatically
- During restart, `readinessProbe` keeps the pod out of the load balancer
- Other replica still serves traffic — **zero downtime**

---

### ✅ Scenario 5 — Watching Self-Healing in Real Time
```bash
kubectl get pods -w                      # Watch pods live
kubectl describe pod <pod-name>          # See probe failures and events
kubectl logs <pod-name> --previous       # Logs from the crashed container
```

---

### ✅ Scenario 6 — Accessing the App via Ingress
```bash
minikube addons enable ingress           # Enable the Nginx Ingress controller
minikube ip                              # Get Minikube IP (e.g. 192.168.49.2)
# Add to /etc/hosts:
# 192.168.49.2  todo.app.com
```
Then visit `http://todo.app.com` in the browser.

---

### ✅ Scenario 7 — Resource Limits Verification
```bash
kubectl top pods                         # See actual CPU/memory usage
kubectl describe node                    # See node capacity and allocated resources
```

---

## 5. Docker Compose Explained (Line by Line)

```yaml
services:                          # Defines all the containers in this application

  mongo:                           # Service name (also the DNS hostname for other services)
    image: mongo:8                 # Use official MongoDB version 8 from Docker Hub
    container_name: todo-mongo     # Give the container a fixed, human-readable name
    restart: unless-stopped        # Restart if crashed, but not if manually stopped
    volumes:
      - mongo-data:/data/db        # Mount named volume to /data/db (where Mongo stores data)
    networks:
      - todo-net                   # Attach to the private bridge network

  backend:
    build:
      context: ./backend           # Build the image using the ./backend folder as context
      dockerfile: Dockerfile       # Use the Dockerfile in that context folder
    container_name: todo-backend
    restart: unless-stopped
    environment:
      MONGO_URI: mongodb://mongo:27017/todoapp   # 'mongo' resolves to the mongo service via DNS
      PORT: 5000
    depends_on:
      - mongo                      # Start mongo container BEFORE backend (no health guarantee)
    networks:
      - todo-net

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: todo-frontend
    restart: unless-stopped
    ports:
      - "3000:3000"                # Map host port 3000 → container port 3000 (host:container)
    depends_on:
      - backend
    networks:
      - todo-net

volumes:
  mongo-data:                      # Declare the named volume (Docker manages its location on disk)

networks:
  todo-net:
    driver: bridge                 # Create an isolated bridge network for inter-service communication
```

---

## 6. Kubernetes YAML Files Explained

### 6.1 PersistentVolumeClaim — `mongodb-pvc.yaml`

```yaml
apiVersion: v1                     # Core Kubernetes API group
kind: PersistentVolumeClaim        # Asking the cluster for a piece of storage

metadata:
  name: mongodb-pvc                # The name used to reference this claim in other YAMLs

spec:
  accessModes:
    - ReadWriteOnce                # Only ONE node can mount this volume at a time (suitable for databases)
  resources:
    requests:
      storage: 5Gi                 # Request 5 gigabytes of persistent storage
```

> **Why needed?** Without a PVC, MongoDB data is lost when the pod restarts. The PVC stores data on the host node's disk, outside the pod lifecycle.

---

### 6.2 MongoDB — `mongodb.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment                   # Kubernetes will manage this stateful app as a Deployment

metadata:
  name: mongodb

spec:
  replicas: 1                      # Only 1 replica — ReadWriteOnce PVC can't be shared across nodes

  selector:
    matchLabels:
      app: mongodb                 # This Deployment manages all pods with label app=mongodb

  template:                        # Blueprint for each pod
    metadata:
      labels:
        app: mongodb               # Pods get this label so the Deployment and Service can find them

    spec:
      containers:
        - name: mongodb
          image: mongo:8           # Official MongoDB 8 image

          ports:
            - containerPort: 27017 # MongoDB's default port; informational only (doesn't publish externally)

          volumeMounts:
            - name: mongodb-storage
              mountPath: /data/db  # Mount the volume at the path where MongoDB writes its data files

      volumes:
        - name: mongodb-storage
          persistentVolumeClaim:
            claimName: mongodb-pvc # Connect this volume to the PVC we created

---                                # YAML separator — multiple resources in one file

apiVersion: v1
kind: Service                      # A stable network endpoint for the MongoDB pods

metadata:
  name: mongodb                    # Other pods use "mongodb" as the hostname to connect

spec:
  selector:
    app: mongodb                   # Route traffic to pods with this label

  ports:
    - port: 27017                  # Port the Service listens on (inside the cluster)
      targetPort: 27017            # Port the MongoDB pod is actually listening on
                                   # No 'type' specified = defaults to ClusterIP (cluster-internal only)
```

---

### 6.3 Backend Deployment — `backend-deployment.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment

metadata:
  name: todo-backend

spec:
  replicas: 2                      # Run 2 copies for high availability and load distribution

  selector:
    matchLabels:
      app: todo-backend            # This Deployment owns pods labelled app=todo-backend

  template:
    metadata:
      labels:
        app: todo-backend

    spec:
      containers:
        - name: backend
          image: k8s-todo-backend:v5        # Local image built with: docker build -t k8s-todo-backend:v5
          imagePullPolicy: IfNotPresent     # Use local image; don't try to pull from Docker Hub

          ports:
            - containerPort: 5000

          env:
            - name: PORT
              value: "5000"
            - name: MONGO_URI
              value: "mongodb://mongodb:27017/todoapp"  # 'mongodb' resolves via the MongoDB Service name

          # ── STARTUP PROBE ──────────────────────────────────────────────────────
          startupProbe:
            httpGet:
              path: /api/health    # Call this endpoint to check if the app has started
              port: 5000
            failureThreshold: 30   # Allow up to 30 failures before giving up
            periodSeconds: 5       # Check every 5 seconds → max 150 seconds to start up
            # NOTE: Other probes don't start until startupProbe passes

          # ── READINESS PROBE ────────────────────────────────────────────────────
          readinessProbe:
            httpGet:
              path: /api/health
              port: 5000
            periodSeconds: 5       # Check every 5 seconds
            timeoutSeconds: 2      # Request must respond within 2 seconds
            failureThreshold: 3    # 3 consecutive failures → pod removed from Service load balancer
            # Effect: pod stops receiving traffic but is NOT restarted

          # ── LIVENESS PROBE ─────────────────────────────────────────────────────
          livenessProbe:
            httpGet:
              path: /api/health
              port: 5000
            periodSeconds: 5
            timeoutSeconds: 2
            failureThreshold: 3    # 3 failures → pod is KILLED and restarted
            # Effect: Kubernetes restarts the container automatically

          # ── RESOURCE MANAGEMENT ────────────────────────────────────────────────
          resources:
            requests:
              cpu: 100m            # 0.1 CPU core — the minimum guaranteed to this pod (for scheduling)
              memory: 128Mi        # 128 MiB RAM guaranteed
            limits:
              cpu: 500m            # 0.5 CPU core maximum (throttled if exceeded)
              memory: 512Mi        # 512 MiB max (pod killed with OOMKill if exceeded)
```

---

### 6.4 Backend Service — `backend-service.yaml`

```yaml
apiVersion: v1
kind: Service

metadata:
  name: todo-backend               # DNS name used by Ingress to forward /api/* traffic

spec:
  selector:
    app: todo-backend              # Routes to all pods with label app=todo-backend

  ports:
    - port: 5000                   # Port the Service exposes to other cluster resources
      targetPort: 5000             # Port the backend pods are actually listening on

  type: ClusterIP                  # Only accessible inside the cluster (the Ingress calls this)
```

---

### 6.5 Frontend Deployment — `frontend-deployment.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment

metadata:
  name: todo-frontend

spec:
  replicas: 2                      # 2 Nginx frontend replicas

  selector:
    matchLabels:
      app: todo-frontend

  template:
    metadata:
      labels:
        app: todo-frontend

    spec:
      containers:
        - name: frontend
          image: k8s-todo-frontend:v3
          imagePullPolicy: IfNotPresent

          ports:
            - containerPort: 80    # Nginx serves on port 80

          readinessProbe:
            httpGet:
              path: /              # Check if Nginx is serving the index page
              port: 80

          livenessProbe:
            httpGet:
              path: /
              port: 80

          resources:
            requests:
              cpu: 100m
              memory: 64Mi         # Frontend is lighter — Nginx needs less memory
            limits:
              cpu: 500m
              memory: 128Mi
```

> **Note:** Frontend has no `startupProbe` — Nginx starts almost instantly, so it's not needed.

---

### 6.6 Frontend Service — `frontend-service.yaml`

```yaml
apiVersion: v1
kind: Service

metadata:
  name: todo-frontend              # DNS name used by Ingress to forward / traffic

spec:
  selector:
    app: todo-frontend

  ports:
    - port: 80                     # Expose port 80 internally
      targetPort: 80               # Nginx inside the pod listens on 80

  type: ClusterIP                  # Internal only — Ingress handles external access
```

---

### 6.7 Ingress — `ingress.yaml`

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress                      # HTTP-level router at the cluster edge

metadata:
  name: todo-ingress

spec:
  ingressClassName: nginx          # Use the Nginx Ingress Controller (installed via minikube addons)

  rules:
    - host: todo.app.com           # Only handle requests for this hostname

      http:
        paths:
          - path: /api             # Match any URL that starts with /api
            pathType: Prefix       # Prefix match (not exact)

            backend:
              service:
                name: todo-backend # Forward to the todo-backend Service
                port:
                  number: 5000

          - path: /                # Match everything else (catch-all)
            pathType: Prefix

            backend:
              service:
                name: todo-frontend
                port:
                  number: 80
```

> ⚠️ **Order matters!** `/api` must come before `/` — Ingress checks rules top to bottom.

---

## 7. Quick Command Reference

```bash
# ── Minikube ──────────────────────────────────────────
minikube start                          # Start the local cluster
minikube status                         # Check cluster health
minikube ip                             # Get the IP to use in /etc/hosts
minikube addons enable ingress          # Enable Nginx Ingress controller
eval $(minikube docker-env)             # Use Minikube's Docker daemon

# ── Build Images (inside Minikube's Docker) ───────────
docker build -t k8s-todo-backend:v5 ./backend
docker build -t k8s-todo-frontend:v3 ./frontend

# ── Apply Manifests ───────────────────────────────────
kubectl apply -f k8s/                   # Apply all files in the k8s/ folder
kubectl delete -f k8s/                  # Remove all resources

# ── Observe & Debug ───────────────────────────────────
kubectl get pods                        # List all pods and their status
kubectl get pods -w                     # Watch pods in real time
kubectl get services                    # List services and their IPs
kubectl get ingress                     # List ingress and address

kubectl describe pod <pod-name>         # Full events and probe status
kubectl logs <pod-name>                 # Current logs
kubectl logs <pod-name> --previous      # Logs from the last crashed instance
kubectl exec -it <pod-name> -- sh       # Shell into a running pod

kubectl top pods                        # Resource usage (requires metrics-server)
kubectl top nodes

# ── Scaling ───────────────────────────────────────────
kubectl scale deployment todo-backend --replicas=4
```

---

## 8. What to Practice Next

### 🔶 Level 2 — Intermediate Kubernetes

| Topic | What to Do |
|---|---|
| **ConfigMaps** | Move `MONGO_URI` and `PORT` out of the YAML into a ConfigMap |
| **Secrets** | Store database passwords in a Kubernetes Secret (base64-encoded) |
| **Namespaces** | Deploy the app into a `todo-dev` and `todo-prod` namespace |
| **Rolling Updates** | Change image tag to `v6`, apply, watch `kubectl rollout status` |
| **Rollback** | Run `kubectl rollout undo deployment/todo-backend` after a bad deploy |
| **HPA** | Auto-scale backend pods based on CPU: `kubectl autoscale deployment todo-backend --cpu-percent=50 --min=2 --max=10` |
| **Init Containers** | Add an init container that waits for MongoDB to be ready before the backend starts |
| **StatefulSet** | Re-deploy MongoDB as a StatefulSet instead of a Deployment (better for databases) |

---

### 🔷 Level 3 — Real-World Patterns

| Topic | What to Do |
|---|---|
| **Helm Charts** | Package all k8s YAMLs into a reusable Helm chart with `values.yaml` |
| **Kustomize** | Manage environment differences (dev vs prod) with Kustomize overlays |
| **Resource Quotas** | Set a namespace-level quota to limit total CPU/memory |
| **Network Policies** | Restrict which pods can talk to each other (e.g., only backend can reach MongoDB) |
| **Pod Disruption Budget** | Guarantee at least 1 backend pod is always up during maintenance |
| **Jobs & CronJobs** | Add a CronJob that runs a database backup script every night |
| **Persistent Volume provisioning** | Use a StorageClass to dynamically provision volumes |

---

### 🟣 Level 4 — CI/CD & Observability

| Topic | What to Do |
|---|---|
| **Container Registry** | Push images to Docker Hub or `ghcr.io` instead of using local images |
| **GitHub Actions** | Auto-build and push images on every `git push` |
| **ArgoCD / Flux** | GitOps — auto-sync the cluster when you push YAML changes to Git |
| **Prometheus + Grafana** | Monitor pod CPU/memory/request rates with dashboards |
| **Loki** | Aggregate and search logs from all pods |
| **Jaeger** | Add distributed tracing to see how requests flow through services |

---

### 💡 Immediate Next Steps (Recommended Order)

```
1. ✅ ConfigMaps & Secrets           ← remove hardcoded env vars
2. ✅ Rolling Updates & Rollback     ← understand deployment safety
3. ✅ HPA (autoscaling)              ← let Kubernetes manage capacity
4. ✅ StatefulSet for MongoDB        ← proper database pattern
5. ✅ Helm Chart                     ← package everything cleanly
6. ✅ GitHub Actions + Registry      ← real CI/CD pipeline
```

---

> **Project Started:** August 2026 · Stack: React · Node.js · MongoDB · Docker · Kubernetes (Minikube)
