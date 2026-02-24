# 🐾 PawDays — Animal Daycare on EKS

A full-stack animal daycare booking application, containerized and deployed on **AWS EKS** using a modern GitOps pipeline.

Users can create an account, register their pets, and book available daycare days — all backed by a live **Supabase** Postgres database.

---

## 📐 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        GitHub Repository                         │
│  app/  (Next.js)   infrastructure/  (Terraform, Helm, Ansible)  │
└───────────────────┬─────────────────────────────────────────────┘
                    │ push to main
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                      GitHub Actions (CI)                         │
│  1. Run tests  2. Build Docker image  3. Push to ECR            │
│  4. Update image tag in Helm values                              │
└───────────────────┬─────────────────────────────────────────────┘
                    │ Git change detected
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                     ArgoCD (GitOps CD)                           │
│  Watches repo → syncs Helm chart → rolling deploy to EKS        │
└───────────────────┬─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                      AWS EKS Cluster                             │
│  Next.js pods  ──►  Supabase Cloud (Postgres + Auth)            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🗂️ Project Structure

```
my-eks-project/
├── app/
│   └── animal-daycare/          # Next.js 14 application
│       ├── app/                 # App Router pages
│       │   ├── auth/            # Login, signup, callback
│       │   ├── dashboard/       # Main dashboard
│       │   ├── pets/            # Pet CRUD
│       │   └── bookings/        # Booking CRUD + calendar
│       ├── components/          # Reusable UI components
│       ├── lib/supabase/        # Supabase client (browser + server)
│       ├── types/               # TypeScript types
│       ├── middleware.ts         # Auth route protection
│       ├── Dockerfile           # Multi-stage production build
│       └── supabase/schema.sql  # Database schema + RLS policies
│
└── infrastructure/
    ├── terraform/               # EKS cluster, VPC, ECR, IAM
    ├── ansible/                 # Cluster bootstrap playbooks
    ├── helm-charts/             # App Helm chart
    └── argocd/                  # GitOps application manifests
```

---

## 🧰 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 14 (App Router) | React framework with SSR |
| **Styling** | Tailwind CSS | Utility-first CSS |
| **Auth** | Supabase Auth | Email/password authentication |
| **Database** | Supabase (Postgres) | Hosted Postgres with RLS |
| **Container** | Docker (multi-stage) | Production image build |
| **Registry** | AWS ECR | Docker image storage |
| **Orchestration** | AWS EKS (Kubernetes) | Container orchestration |
| **IaC** | Terraform | Provision AWS infrastructure |
| **Config Mgmt** | Ansible | Cluster bootstrap & setup |
| **Packaging** | Helm Charts | Kubernetes app packaging |
| **GitOps CD** | ArgoCD | Continuous delivery |
| **CI** | GitHub Actions | Build, test, push pipeline |

---

## 🚀 Technologies & Setup

### Next.js 14

The frontend and backend API are built with Next.js 14 using the App Router. Server Components fetch data directly from Supabase on the server, while Client Components handle interactive UI like forms and the booking calendar.

**Key files:**
- `app/layout.tsx` — root layout
- `app/dashboard/page.tsx` — server component, fetches user data
- `components/ui/BookingForm.tsx` — client component with calendar picker
- `middleware.ts` — protects routes, redirects unauthenticated users

**Local dev:**
```bash
cd app/animal-daycare
npm install
npm run dev
# App runs at http://localhost:3000
```

---

### Supabase

Supabase provides the hosted Postgres database, authentication, and auto-generated REST API. The app uses the `@supabase/ssr` package to manage sessions across server and client components via cookies.

**Database tables:**
- `profiles` — user contact info (linked to `auth.users`)
- `pets` — registered animals (owned by user)
- `available_days` — admin-managed open dates with capacity slots
- `bookings` — links pets to available days with a status

**Row Level Security (RLS)** is enabled on all tables so users can only read and write their own data — enforced at the database level.

**Setup:**
1. Create a project at [supabase.com](https://supabase.com)
2. Run `app/animal-daycare/supabase/schema.sql` in the SQL editor
3. Go to **Authentication → Providers → Email** and disable "Confirm email" for local dev
4. Copy your **Project URL** and **Publishable/Anon key** from **Settings → API**

**Environment variables** (`app/animal-daycare/.env.local`):
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-anon-key
```

> ⚠️ `.env.local` is gitignored and never committed. For production, values are injected as Kubernetes Secrets.

---

### Docker

The app uses a **multi-stage Dockerfile** to keep the production image lean and secure.

| Stage | Purpose |
|-------|---------|
| `deps` | Install npm dependencies |
| `builder` | Build the Next.js production bundle |
| `runner` | Minimal runtime image (no dev deps, runs as non-root user) |

**Build:**
```bash
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=<url> \
  --build-arg NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=<key> \
  -t animal-daycare:latest .
```

**Run locally:**
```bash
docker run -p 3000:3000 animal-daycare:latest
```

---

### Terraform

Terraform provisions all AWS infrastructure. State is stored remotely in S3 with DynamoDB locking.

**What it creates:**
- VPC with public/private subnets across 2 AZs
- EKS cluster with managed node groups
- ECR repository for Docker images
- IAM roles with IRSA (pod-level AWS permissions)
- Secrets Manager entries for Supabase keys

**Usage:**
```bash
cd infrastructure/terraform
terraform init
terraform plan
terraform apply
```

**Key files:**
- `main.tf` — EKS cluster, VPC modules
- `variables.tf` — configurable inputs
- `outputs.tf` — cluster endpoint, ECR URL
- `backend.tf` — remote state (S3 + DynamoDB lock)
- `terraform.tfvars.example` — copy to `terraform.tfvars` and fill in values

---

### Ansible

Ansible bootstraps the EKS cluster after Terraform provisions it — installing tooling and base configuration that Terraform doesn't handle.

**What it does:**
- Installs ArgoCD into the cluster
- Configures `ingress-nginx` for HTTP routing
- Sets up `cert-manager` for automatic TLS via Let's Encrypt
- Applies base security hardening to nodes

**Usage:**
```bash
cd infrastructure/ansible
ansible-playbook -i inventory.ini playbooks/bootstrap.yml
```

**Key files:**
- `playbooks/bootstrap.yml` — main cluster setup
- `playbooks/vm-setup-playbook.yml` — node configuration
- `group_vars/all.yml` — shared variables across all hosts

---

### Helm Charts

The app is packaged as a Helm chart for consistent, repeatable deployments across environments.

**What it manages:**
- `Deployment` — app pods with resource limits and health checks
- `Service` — internal ClusterIP service
- `Ingress` — routes external traffic to the app
- `HPA` — auto-scales pods based on CPU/memory
- `ServiceAccount` — pod identity for AWS permissions

**Manual deploy:**
```bash
cd infrastructure/helm-charts
helm install animal-daycare . \
  --set image.tag=latest \
  --set ingress.host=daycare.yourdomain.com \
  --namespace production
```

**Key files:**
- `values.yaml` — default config (replicas, image, ingress, autoscaling)
- `templates/deployment.yaml` — pod spec
- `templates/hpa.yaml` — horizontal pod autoscaler

---

### ArgoCD

ArgoCD implements **GitOps** — it watches this repository and automatically syncs the cluster to match what's in Git. Any merge to `main` triggers a deployment with zero manual steps.

**Access the UI:**
```bash
kubectl port-forward svc/argocd-server -n argocd 8080:443
# Open https://localhost:8080
```

**Register the app:**
```bash
kubectl apply -f infrastructure/argocd/application.yaml
```

**How the GitOps loop works:**
1. GitHub Actions updates the image tag in `helm-charts/values.yaml` and commits it
2. ArgoCD detects the Git change (within 3 min or via webhook)
3. ArgoCD syncs the Helm chart to the cluster — rolling update begins
4. Old pods drain gracefully, new pods come up — zero downtime

`infrastructure/argocd/application.yaml`:
```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: animal-daycare
spec:
  source:
    repoURL: https://github.com/ArchitectN/NH_Ansible_playbooks.git
    path: infrastructure/helm-charts/animal-daycare
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

---

### GitHub Actions

GitHub Actions runs the CI pipeline on every push to `main`, then hands off to ArgoCD for deployment.

**Pipeline steps:**
1. Checkout code
2. Run lint and TypeScript type checks
3. Build Docker image with Supabase build args
4. Authenticate with AWS → push image to ECR
5. Update image tag in `helm-charts/values.yaml`
6. Commit the tag change → ArgoCD detects and deploys

**Secrets to configure** (GitHub → Settings → Secrets → Actions):

| Secret | Description |
|--------|-------------|
| `AWS_ACCESS_KEY_ID` | AWS credentials for ECR push |
| `AWS_SECRET_ACCESS_KEY` | AWS credentials for ECR push |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | Supabase anon key |

---

## 🔐 Security

- `.env.local` is **gitignored** — never committed to the repository
- Supabase keys in production are stored as **Kubernetes Secrets**, injected at runtime
- RLS policies enforce data isolation at the database level — users only see their own data
- Docker image runs as a **non-root user** (`nextjs:nodejs`)
- EKS nodes run in **private subnets** — only the load balancer is publicly reachable
- `node_modules` and `.next/` build output are gitignored

---

## 🗄️ Database Schema

```sql
profiles       → full_name, phone, emergency_contact   (1:1 with auth.users)
pets           → name, species, breed, age, weight      (many per user)
available_days → date, max_capacity, slots_remaining    (managed by admin)
bookings       → pet_id + day_id + status               (confirmed/cancelled/completed)
```

Row Level Security is enabled on all tables. Users can only access rows where `owner_id = auth.uid()`.

---

## 🏁 Quick Start (Local)

```bash
# 1. Clone the repo
git clone https://github.com/ArchitectN/NH_Ansible_playbooks.git
cd NH_Ansible_playbooks/app/animal-daycare

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.local.example .env.local
# Edit .env.local and add your Supabase URL and key

# 4. Run the database schema
# Paste supabase/schema.sql into the Supabase SQL editor

# 5. Start the dev server
npm run dev
# → http://localhost:3000
```

---

## 📦 Deployment Order (First Time)

| Step | Tool | Command |
|------|------|---------|
| 1. Provision AWS infrastructure | Terraform | `terraform apply` |
| 2. Bootstrap cluster tooling | Ansible | `ansible-playbook bootstrap.yml` |
| 3. Push first Docker image | Docker + ECR | `docker build && docker push` |
| 4. Deploy app manually | Helm | `helm install animal-daycare .` |
| 5. Register GitOps app | ArgoCD | `kubectl apply -f application.yaml` |
| 6. Automate pipeline | GitHub Actions | Push to `main` |

After step 6, all future deployments happen automatically on every push to `main`.

---

*Built with 🐾 for pets everywhere*
