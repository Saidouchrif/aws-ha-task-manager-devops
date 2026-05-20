# Frontend Documentation - Task Manager UI

Had `Frontend` howa React app mabni b `Vite + React Router` w kaytwasal m3a backend API.

Features li tkhadmo:
- Register (`POST /api/auth/register`)
- Login (`POST /api/auth/login`)
- Protected tasks page (create/get/update/delete)
- Backend health check (`GET /`)
- Route guards: ila user ma loginch, ay protected URL katrj3o direct l login

## Routes (Frontend)

- `/login`
- `/register`
- `/tasks` (protected)
- `/` -> redirect to `/tasks` ila user login, sinon `/login`

## API Endpoints used

- `GET /`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/tasks`
- `GET /api/tasks`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`

## UI Stack

- Bootstrap 5 CDN
- Bootstrap Icons CDN
- Custom CSS theme (responsive)

## Environment

Create `.env` in `Frontend/` (optional):

```env
VITE_API_URL=http://localhost:5000
```

Ila makaynch, frontend kay defaulti had URL.

## Run

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```

Lint:

```bash
npm run lint
```
