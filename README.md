# AI Incident Intelligence Platform

An **AI-powered Incident Observability Dashboard** built using **React, Node.js, Python ML, Azure Container Apps, Terraform and GitHub Actions**.

This platform simulates how modern SRE / Cloud Engineering teams can automatically:

* Detect incident trends
* Cluster similar failures
* Identify probable root causes
* Visualize incident behaviour in real time

Designed as an **AI + DevOps showcase project** demonstrating end-to-end automation on Azure.

---

# What Problem This Solves

In real enterprise systems (Azure Functions, Kubernetes, APIs, Data pipelines):

* Thousands of logs arrive every minute
* Engineers manually investigate incidents
* Root cause analysis takes time

This platform introduces:

AI-based log clustering
Automated incident generation
Trend visualization
Category detection (Auth / DB / Throttle / Resource)

---

# Architecture Overview

```
React Dashboard (Static Web App)
            │
            ▼
Node.js API (Container App)
            │
            ▼
Python ML Worker
            │
            ▼
Azure Container Apps + Log Analytics
```

### Core Components

* **React + Recharts** → Observability dashboard UI
* **Node.js (Express)** → API orchestration layer
* **Python ML Worker** → Incident clustering engine
* **Terraform** → Infrastructure as Code
* **GitHub Actions** → CI/CD pipeline
* **Azure Container Apps** → Serverless container hosting
* **Azure Static Web Apps** → Frontend hosting
* **Azure Container Registry** → Image storage
* **Log Analytics Workspace** → Observability logs

---

# Features

## Incident Simulation

Each click creates a new incident:

* Timeout (DB / dependency failures)
* Auth / Token errors
* Throttling / Rate limit
* Mixed scenario

---

## Dashboard Visualizations

* Error Trend Line Chart
* Top Error Clusters (Bar Chart)
* Probable Cause Categories (Pie Chart)
* Cluster Details Timeline

---

## AI / ML Logic

The Python ML worker:

* Generates synthetic logs
* Groups messages using clustering logic
* Detects probable category
* Builds signatures from message patterns

If sklearn is unavailable, it gracefully falls back to pure-Python clustering.

---

# Project Structure

```
apps/
 ├── api/          → Node.js backend
 ├── web/          → React dashboard
 └── ml-worker/    → Python AI logic

infra/
 └── terraform/    → Azure infrastructure

.github/workflows/
 ├── terraform.yml
 ├── deploy-api.yml
 └── deploy-web.yml
```

---

# Local Development

## Start API

```
cd apps/api
npm install
node index.js
```

API runs at:

```
http://localhost:4000
```

---

## Start React Dashboard

```
cd apps/web
npm install
npm run dev
```

Open:

```
http://localhost:5173
```

---

# Azure Deployment (Automated)

Deployment uses:

* Terraform (infra creation)
* GitHub OIDC login
* Azure Container Apps
* Azure Static Web Apps

Push to `main` branch triggers:

```
terraform.yml      → infrastructure
deploy-api.yml     → container image build + deploy
deploy-web.yml     → frontend deployment
```

---

# Infrastructure Created

Terraform provisions:

* Resource Group
* Azure Container App Environment
* Container App (Node API)
* Azure Static Web App (React UI)
* Azure Container Registry (ACR)
* Log Analytics Workspace

---

# Observability

Log Analytics Workspace captures:

* Container logs
* Runtime events
* Health state

Future enhancements may include:

* KQL queries for incident analytics
* AI anomaly detection
* Timeline reconstruction

---

# Security

Uses **Azure Federated OIDC Authentication**:

No client secrets stored in repo.

GitHub Actions authenticate directly with Azure AD.

---

# CI/CD Flow

```
Developer Push → GitHub Actions
                → Terraform Apply
                → Docker Build
                → Push to ACR
                → Container App Update
                → Static Web Deploy
```

---

# Example API Endpoints

```
GET  /health
GET  /incidents
GET  /incidents/{id}/trends
GET  /incidents/{id}/clusters
POST /simulate-alert
```

---

# Tech Stack

Frontend:

* React
* Vite
* Recharts

Backend:

* Node.js
* Express

AI:

* Python
* DBSCAN clustering (optional)
* Fallback heuristic engine

Cloud:

* Azure Container Apps
* Azure Static Web Apps
* Terraform
* GitHub Actions

---

# Future Enhancements

* KQL powered dashboards
* Real-time Azure Monitor ingestion
* OpenAI assisted incident summarization
* AI anomaly detection model
* Multi-service correlation engine
* Timeline replay of incidents

---

# Author

Cloud / DevOps / Observability focused engineering project demonstrating AI-driven incident intelligence using Azure native architecture.

---

If you found this useful, feel free to fork or build your own AI observability platform!
