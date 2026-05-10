# Deployment Guide

## Stack
- Frontend: Next.js 15 (standalone) → https://hamdancomputers.com
- Backend: FastAPI → https://api.hamdancomputers.com
- Database: PostgreSQL 16
- Server: AWS Lightsail, Ubuntu, IP: 51.44.26.218
- Registry: GitHub Container Registry (GHCR)
- DNS/SSL: Cloudflare (Full strict) + Origin Certificate

## Images
- `ghcr.io/jameel-z/ecommerce-backend:latest`
- `ghcr.io/jameel-z/ecommerce-frontend:latest`

Frontend is built with `NEXT_PUBLIC_API_BASE_URL=https://api.hamdancomputers.com` baked in at build time.

## Server layout
- App: `~/E-commerce`
- Reverse proxy: `~/reverse-proxy/nginx.conf` (also handles invoicepoint.net)
- SSL cert: `/etc/nginx/ssl/hamdancomputers/origin.crt` + `origin.key`

## Environment variables
The file `backend/.env` is never committed. Create it manually on the server:

```env
SECRET_KEY=...
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=3600

ALLOWED_ORIGINS=https://hamdancomputers.com,https://api.hamdancomputers.com

DB_USER=postgres
DB_PASSWORD=...
DB_HOST=db
DB_PORT=5432
DB_NAME=ecommerce_db

POSTGRES_USER=postgres
POSTGRES_PASSWORD=...
POSTGRES_DB=ecommerce_db

ADMIN_EMAIL=jameel@hamdancomputers.com
ADMIN_PASSWORD=...
```

## First deploy (manual)
```bash
# On server
cd ~/E-commerce
docker compose pull
docker compose up -d
```

## Updating manually (without CI/CD)
```bash
# Build and push from local machine
docker build -t ghcr.io/jameel-z/ecommerce-backend:latest ./backend
docker push ghcr.io/jameel-z/ecommerce-backend:latest

docker build -t ghcr.io/jameel-z/ecommerce-frontend:latest \
  --build-arg NEXT_PUBLIC_API_BASE_URL=https://api.hamdancomputers.com ./frontend
docker push ghcr.io/jameel-z/ecommerce-frontend:latest

# Then on server
cd ~/E-commerce && docker compose pull && docker compose up -d
```

## CI/CD with GitHub Actions (Phase 3)
Create `.github/workflows/deploy.yml` — on every push to main it will:
1. Build and push images to GHCR (using automatic GITHUB_TOKEN)
2. SSH into the server and run `docker compose pull && docker compose up -d`

### Required GitHub repo secrets
| Secret | Value |
|--------|-------|
| `SERVER_HOST` | `51.44.26.218` |
| `SERVER_USER` | `ubuntu` |
| `SERVER_SSH_KEY` | SSH private key with access to the server |

### Generate deploy key on server
```bash
ssh-keygen -t ed25519 -C "github-deploy" -f ~/.ssh/github_deploy -N ""
cat ~/.ssh/github_deploy.pub >> ~/.ssh/authorized_keys
cat ~/.ssh/github_deploy  # paste this into SERVER_SSH_KEY secret
```
