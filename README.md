# AWS HA Task Manager DevOps

<p align="center">
  <img src="Frontend/public/task-manager-favicon.svg" alt="Task Manager Logo" width="96" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/AWS-232F3E?style=for-the-badge&logo=amazonaws&logoColor=white" alt="AWS" />
  <img src="https://img.shields.io/badge/DevOps-0A66C2?style=for-the-badge&logo=githubactions&logoColor=white" alt="DevOps" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/GitHub%20Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white" alt="GitHub Actions" />
  <img src="https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
</p>

A full-stack **Task Manager** project with a **React frontend**, **Node.js/Express backend**, **PostgreSQL database**, and a **DevOps pipeline** targeting **high-availability deployment on AWS**.

## Project Overview

This repository contains:

- Secure authentication with JWT (register/login)
- Task CRUD endpoints protected by auth middleware
- Responsive React frontend with protected routes
- Dockerized frontend/backend/database services
- GitHub Actions CI for testing and image checks
- GitHub Actions pre-production pipeline for automated EC2 deployment

## Tech Stack

- Frontend: React, Vite, React Router, Axios, Bootstrap
- Backend: Node.js, Express, Sequelize, JWT, bcryptjs
- Database: PostgreSQL
- Containers: Docker, Docker Compose
- CI/CD: GitHub Actions
- Cloud/Infra Target: AWS EC2 (multi-instance), optional RDS/ALB architecture

## Repository Structure

```text
aws-ha-task-manager-devops/
  Backend/
    config/
    controllers/
    middlewares/
    Models/
    routes/
    tests/
    server.js
  Frontend/
    public/
    src/
    Dockerfile
  .github/workflows/
    ci.yml
    pre-prod.yml
  docker-compose.yml
  README.md
```

## Application Architecture

```text
User Browser
   |
   v
Frontend (React/Vite)
   |
   v
Backend API (Node/Express)
   |
   v
PostgreSQL
```

In AWS HA mode (target design):

```text
Users -> Load Balancer -> EC2 Server 1 (frontend+backend containers)
                      -> EC2 Server 2 (frontend+backend containers)

Both app servers connect to shared DB layer (PostgreSQL / RDS).
```

## Backend API Routes

| Method | Route | Description | Auth |
|---|---|---|---|
| GET | `/` | Health check | No |
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login and get JWT | No |
| GET | `/api/tasks` | Get current user tasks | Yes |
| POST | `/api/tasks` | Create task | Yes |
| PUT | `/api/tasks/:id` | Update task | Yes |
| DELETE | `/api/tasks/:id` | Delete task | Yes |

## Frontend Features

- Login and register pages
- Protected `/tasks` page
- Auto redirect to login when user is not authenticated
- Task create, list, update, delete
- Dynamic API base URL for multi-server deploy:
  - Uses `window.location.hostname` + port `5000`
  - No hardcoded server IPs in code

## Local Development

### Prerequisites

- Node.js 20+
- npm
- Docker + Docker Compose

### Run with Docker Compose

```bash
docker compose up -d --build
```

Services by default:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- PostgreSQL: `localhost:5432`
- pgAdmin: `http://localhost:5050`

### Run manually (without Docker)

Backend:

```bash
cd Backend
npm install
npm run dev
```

Frontend:

```bash
cd Frontend
npm install
npm run dev
```

## Testing

Backend tests are in `Backend/tests`:

```bash
cd Backend
npm test -- tests
```

Current route test coverage includes:

- Auth routes (`register`, `login`)
- Task routes (`create`, `get`, `update`, `delete`) with auth middleware behavior

## CI/CD Workflows

### 1) CI Workflow

File: `.github/workflows/ci.yml`

On `main`/`dev` push or PR:

- Installs dependencies
- Runs backend tests
- Builds frontend
- Builds Docker images
- Runs Docker smoke checks

### 2) Pre-Production Deployment Workflow

File: `.github/workflows/pre-prod.yml`

On push to branch `pre/production`:

1. Runs full test suite and build checks
2. If tests pass, deploys over SSH to **server 1** and **server 2**
3. On each server:
   - `cd /home/ubuntu/aws-ha-task-manager-devops`
   - `git checkout pre/production`
   - `git pull origin pre/production`
   - Auto-generate `Backend/.env` from GitHub Secrets
   - `sudo docker-compose down`
   - `sudo docker-compose up -d --build`

If tests fail, deployment is blocked.

## Required GitHub Secrets

For deployment:

- `EC2_HOST_1`
- `EC2_HOST_2`
- `EC2_USER`
- `EC2_KEY`

For backend runtime `.env` generation:

- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `JWT_SECRET`

## Environment Variables (Backend)

Generated automatically in pre-prod deploy, equivalent to:

```env
PORT=5000
DB_HOST=postgres
DB_PORT=5432
DB_USER=...
DB_PASSWORD=...
DB_NAME=...
JWT_SECRET=...
```

## Troubleshooting

- If login returns 500, check backend logs:
  - `docker compose logs -f backend`
- Ensure `JWT_SECRET` is defined in secrets (or local env).
- Linux servers are case-sensitive. Imports are normalized to `Backend/Models`.

## Author

Built by Said Ouchrif as a DevOps + Full-Stack practice project for AWS high-availability deployment.
