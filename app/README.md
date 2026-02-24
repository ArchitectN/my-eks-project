# 🐾 PawDays — Animal Daycare App

A full-stack CRUD application for managing animal daycare bookings. Built with **Next.js 14**, **Supabase**, styled with **Tailwind CSS**, and deployed on **EKS** via Helm + ArgoCD.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) + Tailwind CSS |
| Backend | Next.js API routes + Server Components |
| Auth | Supabase Auth (email/password) |
| Database | Supabase (Postgres + RLS) |
| Container | Docker (multi-stage) |
| Orchestration | AWS EKS |
| IaC | Terraform |
| Config | Ansible |
| Deploy | Helm Charts + ArgoCD (GitOps) |
| CI | GitHub Actions |

---

## Getting Started

### 1. Clone & install
```bash
git clone <your-repo>
cd animal-daycare
npm install
```

### 2. Set up Supabase
1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase/schema.sql` in the Supabase SQL editor


### 3. Configure environment
```bash
cp .env.local.example .env.local
# Fill in your Supabase values
```

### 4. Run locally
```bash
npm run dev
```

---

## Features

- **Auth** — Email/password signup & login with Supabase Auth
- **Pets CRUD** — Add, edit, delete pets (dog/cat/bird/rabbit/other)
- **Bookings** — Pick available dates from calendar, confirm/cancel bookings
- **Dashboard** — At-a-glance stats and upcoming visits
- **RLS** — Row-level security ensures users only see their own data

---

## Database Schema

```
profiles          → user contact info (linked to auth.users)
pets              → registered animals (owned by user)
available_days    → admin-managed open dates with capacity
bookings          → pet + available_day + status (confirmed/cancelled/completed)
```

---

## Docker Build

```bash
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=<url> \
  --build-arg NEXT_PUBLIC_PUBLISHABLE_DEFAULT_KEY=<key> \
  -t animal-daycare:latest .

docker run -p 3000:3000 \
  animal-daycare:latest
```

---

## Deployment

See `infrastructure/` for:
- `terraform/` — EKS cluster, VPC, ECR, IAM
- `ansible/` — Cluster bootstrap (ArgoCD, ingress, cert-manager)
- `helm-charts/` — App Helm chart
- `argocd/` — GitOps application manifest
- `.github/workflows/` — CI pipeline (test → build → push → update tag)
