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
  <img src="https://img.shields.io/badge/pgAdmin-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="pgAdmin" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
</p>

Full-stack Task Manager with High Availability deployment on AWS:
- Frontend: React + Vite
- Backend: Node.js + Express + Sequelize
- Database: PostgreSQL
- Containerization: Docker + Docker Compose
- CI/CD: GitHub Actions

## 1) Project Goals

This project demonstrates a complete DevOps flow for a production-like setup:
- JWT authentication (register/login)
- Protected task CRUD API
- React frontend with protected routes
- Multi-server app deployment behind AWS Load Balancer
- Shared database server for consistent data across app servers
- Automated test/build/deploy pipelines

## 2) Architecture

### Local development architecture

```text
Browser -> Frontend (Vite) -> Backend (Express) -> PostgreSQL
```

### Pre-production HA architecture

```text
Users
  |
  v
AWS Load Balancer
  |-------------------------> App Server 1 (frontend_app + backend_api)
  |
  |-------------------------> App Server 2 (frontend_app + backend_api)

App Server 1 and App Server 2 -> Shared DB Server (postgres_db + pgadmin)
```

## 3) Tech Stack

### Frontend
- React 19
- React Router DOM
- Axios
- Vite
- Bootstrap CSS + Bootstrap Icons (CDN)

### Backend
- Node.js 20
- Express 5
- Sequelize
- PostgreSQL driver (`pg`)
- JWT (`jsonwebtoken`)
- Password hashing (`bcryptjs`)

### DevOps
- Docker / Docker Compose
- GitHub Actions
- AWS EC2
- AWS Load Balancer

## 4) Repository Structure

```text
aws-ha-task-manager-devops/
  .github/
    workflows/
      ci.yml
      pre-prod.yml

  Backend/
    config/
      db.js
    controllers/
      authController.js
      taskController.js
    middlewares/
      authMiddleware.js
    Models/
      userModel.js
      taskModel.js
    routes/
      index.js
      authRoutes.js
      taskRoutes.js
    tests/
      auth.test.js
      task.test.js
    Dockerfile
    package.json
    server.js

  Frontend/
    public/
    src/
      api.js
      api/client.js
      auth/
      pages/
    Dockerfile
    package.json
    vite.config.js

  docker-compose.yml
  docker-compose.app.yml
  docker-compose.db.yml
  README.md
```

## 5) API Endpoints

Base API prefix: `/api`

### Health
- `GET /`
  - Response: `{ "message": "Backend API is running" }`

### Auth
- `POST /api/auth/register`
  - Body:
    ```json
    {
      "name": "Said",
      "email": "said@example.com",
      "password": "123456"
    }
    ```
- `POST /api/auth/login`
  - Body:
    ```json
    {
      "email": "said@example.com",
      "password": "123456"
    }
    ```
  - Response includes JWT token.

### Tasks (Protected)
Authorization header required:
`Authorization: Bearer <token>`

- `GET /api/tasks`
- `POST /api/tasks`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`

Task status used by UI: `pending`, `in-progress`, `done`.

## 6) Frontend Behavior

- Public routes:
  - `/login`
  - `/register`
- Protected route:
  - `/tasks`
- If user is not authenticated and tries to access protected route, app redirects to `/login`.
- Auth state is stored in localStorage (`task_manager_auth`).

## 7) API URL Strategy (No hardcoded localhost)

Frontend HTTP client uses:
- `VITE_API_URL` if provided
- Fallback: `window.location.protocol + // + window.location.hostname`

This makes same frontend code portable across multiple servers.

`Frontend/src/api.js` also retries login once when `502` happens, to mitigate transient load balancer target issues.

## 8) Backend Startup Hardening

`Backend/server.js` includes:
- Database connection retry loop (`DB_CONNECT_MAX_RETRIES`, `DB_CONNECT_RETRY_DELAY_MS`)
- Starts HTTP server only after DB authentication + sync
- `keepAliveTimeout` and `headersTimeout` tuned for load balancer stability

## 9) Docker Compose Files

### `docker-compose.yml` (Local only)
Contains full local stack:
- frontend
- backend
- postgres
- pgadmin

Use this for development on one machine.

### `docker-compose.app.yml` (App servers)
Contains only:
- frontend
- backend

No local postgres service. App servers connect to shared DB server via `Backend/.env` (`DB_HOST`).

### `docker-compose.db.yml` (DB server)
Contains only:
- postgres
- pgadmin

## 10) Environment Variables

### Backend (`Backend/.env`)

```env
PORT=5000
DB_HOST=172.31.27.188
DB_PORT=5432
DB_USER=...
DB_PASSWORD=...
DB_NAME=...
JWT_SECRET=...
DB_CONNECT_MAX_RETRIES=12
DB_CONNECT_RETRY_DELAY_MS=5000
```

### Frontend (`Frontend/.env`)

```env
VITE_API_URL=http://ha-load-balancer-113284686.us-east-1.elb.amazonaws.com
VITE_INTERNAL_API_URL=http://host.docker.internal:5000
```

Notes:
- `VITE_API_URL` is used by browser requests.
- `VITE_INTERNAL_API_URL` is used by Vite proxy inside container when needed.

## 11) Local Run

### Option A: Docker (recommended)

```bash
docker compose up -d --build
```

Services:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- PostgreSQL: `localhost:5432`
- pgAdmin: `http://localhost:5050`

### Option B: Manual run

Backend:
```bash
cd Backend
npm ci
npm run dev
```

Frontend:
```bash
cd Frontend
npm ci
npm run dev
```

## 12) Testing and Quality

### Backend tests

```bash
cd Backend
npm test -- tests
```

Current test suites:
- `tests/auth.test.js`
- `tests/task.test.js`

### Frontend lint

```bash
cd Frontend
npm run lint
```

## 13) CI Workflow (`.github/workflows/ci.yml`)

Triggered on push/PR to `main` and `dev`.

Jobs:
1. Backend CI
   - Install dependencies
   - Run tests
2. Frontend CI
   - Install dependencies
   - Build frontend
3. Docker CI
   - Build backend image
   - Build frontend image
   - Run smoke checks

## 14) Pre-Prod Deployment Workflow (`.github/workflows/pre-prod.yml`)

Triggered on push to branch: `pre/production`

Flow:
1. Run test suite + lint + build + docker smoke tests.
2. Deploy DB stack on server 3.
3. Deploy app stack on server 1 and server 2.
4. Validate runtime state (containers + env + health checks).

### App server deploy steps
- Ensure repo exists at `/home/ubuntu/aws-ha-task-manager-devops`
- `git checkout pre/production`
- `git pull origin pre/production`
- Generate `Backend/.env` from GitHub Secrets
- Generate `Frontend/.env`
- Remove any local `postgres_db` / `pgadmin` if present
- `docker-compose -f docker-compose.app.yml down`
- `docker-compose -f docker-compose.app.yml up -d --build`
- Verify backend health on `http://127.0.0.1:5000/`

### DB server deploy steps
- Ensure repo exists and updated
- Generate root `.env` with DB + pgAdmin secrets
- Start `postgres` and `pgadmin` with `docker-compose.db.yml`
- Fail pipeline if `postgres_db` or `pgadmin` is not running

## 15) Required GitHub Secrets

### SSH and hosts
- `EC2_HOST_1`
- `EC2_HOST_2`
- `EC2_HOST_3`
- `EC2_USER`
- `EC2_KEY`

### Backend runtime
- `DB_HOST`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `JWT_SECRET`

### pgAdmin runtime
- `PGADMIN_DEFAULT_EMAIL`
- `PGADMIN_DEFAULT_PASSWORD`

## 16) Quick Operational Checks

### App server checks

```bash
sudo docker ps
sudo docker logs backend_api --tail=100
sudo docker exec backend_api printenv DB_HOST
curl -i http://127.0.0.1:5000/
```

Expected app containers:
- `frontend_app`
- `backend_api`

No local DB containers expected on app servers.

### DB server checks

```bash
sudo docker ps
sudo docker logs postgres_db --tail=100
sudo docker logs pgadmin --tail=100
```

Expected DB containers:
- `postgres_db`
- `pgadmin`

## 17) Common Issues and Fixes

### 1. `VITE_API_URL is missing`
- Cause: `Frontend/.env` not generated before build/start.
- Fix: Ensure workflow writes `Frontend/.env` before `docker-compose ... up --build`.

### 2. `502 Bad Gateway` on login
- Possible causes:
  - One LB target not healthy
  - Backend start race while DB not ready
- Mitigations in project:
  - Backend DB retry logic before listen
  - Health check in deploy workflow
  - One-time frontend retry for login 502

### 3. Inconsistent data between refreshes
- Cause: app servers not using same DB host.
- Fix: verify `DB_HOST` inside `backend_api` on both app servers is same shared DB private IP.

### 4. Linux import case-sensitivity errors
- `Models` folder naming is case-sensitive on Linux.
- Keep imports consistent with `Backend/Models/...`.

## 18) Security Notes

- Never commit real secrets to repository.
- Use GitHub Actions Secrets for all credentials.
- Restrict security groups:
  - App servers -> DB server: allow 5432 only from app private range.
  - Public access only through load balancer and required ports.

## 19) Branch Strategy

- `main`: stable branch
- `dev`: development branch
- `pre/production`: pre-production CI/CD branch used for EC2 deployment

## 20) Author

Built by Said Ouchrif as a Full-Stack + DevOps AWS High Availability project.
