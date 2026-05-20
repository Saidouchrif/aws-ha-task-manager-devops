# Backend Documentation - Task Manager API

Had `Backend` howa REST API mabni b `Node.js + Express + Sequelize + PostgreSQL`.
Kiydir:
- Authentication b `JWT` (register/login)
- CRUD dyal tasks
- Rabt kol task b user mo3ayan

## 1. Tech Stack

- Runtime: `Node.js`
- Framework: `Express`
- ORM: `Sequelize`
- Database: `PostgreSQL`
- Auth: `jsonwebtoken (JWT)`
- Password Hashing: `bcryptjs`
- Dev Server: `nodemon`

## 2. Project Structure

```txt
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
  server.js
  package.json
  Dockerfile
  .env
```

## 3. Startup Flow (Kifach backend kaykhdem)

Mlli katlanci `server.js`:
1. Kay loadi env vars mn `.env`.
2. Kay connecti l PostgreSQL b `sequelize`.
3. Kay loadi models (`User`, `Task`) bash associations ytkhli9o.
4. Kaydir `sequelize.sync()` bach tables ytsaybo/ytupdatew.
5. Kay expose API ta7t `/api`.

## 4. Database Configuration (`config/db.js`)

`Sequelize` kaytconfigura b had variables:
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`

Functions mohimmin:
- `checkDatabaseConnection()`: kay testi connection b `sequelize.authenticate()`.
- `syncDatabase()` (mawjoda f file): katsynci schema.

F `server.js` daba katdar direct `await sequelize.sync();`, yani tables kaytsaybo 3nd startup.

## 5. Data Models

### User (`Models/userModel.js`)

Table: `users`
- `id` (auto by Sequelize)
- `name` (`STRING`, required)
- `email` (`STRING`, required, unique)
- `password` (`STRING`, required, hashed)
- `createdAt`, `updatedAt`

### Task (`Models/taskModel.js`)

Table: `tasks`
- `id` (auto)
- `title` (`STRING`, required)
- `description` (`TEXT`, optional)
- `status` (`STRING`, default: `pending`)
- `userId` (foreign key -> `users.id`)
- `createdAt`, `updatedAt`

### Relation

- `User.hasMany(Task)`  
- `Task.belongsTo(User)`  
- Ila tms7 user, tasks dyalo kaytm7aw (`onDelete: "CASCADE"`).

## 6. Authentication Flow

### Register
- Endpoint: `POST /api/auth/register`
- Input: `name`, `email`, `password`
- Steps:
1. Kaychof wach email deja kayn.
2. Kayhasha password b `bcrypt.hash(..., 10)`.
3. Kaycreate user jdida.

### Login
- Endpoint: `POST /api/auth/login`
- Input: `email`, `password`
- Steps:
1. Kayjib user b email.
2. Kayverify password b `bcrypt.compare`.
3. Ila s7i7, kaynsha2 JWT token (`expiresIn: 7d`).

Token payload:
- `id`
- `email`

## 7. Middleware (`middlewares/authMiddleware.js`)

Had middleware kay7mi routes dyal tasks:
1. Kayqra `Authorization` header (`Bearer <token>`).
2. Kayverify token b `JWT_SECRET`.
3. Kay7et decoded user f `req.user`.
4. Ila token ghaib/ghalat => `401`.

## 8. Task Endpoints

Kol endpoints hna m7miyin b auth middleware.

### Create task
- `POST /api/tasks`
- Body:
```json
{
  "title": "Finish report",
  "description": "Submit before Friday"
}
```

### Get my tasks
- `GET /api/tasks`
- Katrje3 gha tasks dyal user li login.
- Order: jdad l9dam (`createdAt DESC`).

### Update task
- `PUT /api/tasks/:id`
- Katupdate gha task li kat belongi l nafs user.

### Delete task
- `DELETE /api/tasks/:id`
- Katms7 gha task dyal nafs user.

## 9. API Routes Map

- `GET /` -> health message
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/tasks`
- `GET /api/tasks`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`

## 10. Environment Variables (`.env`)

```env
PORT=5000

DB_HOST=postgres
DB_PORT=5432
DB_USER=admin
DB_PASSWORD=admin123
DB_NAME=taskmanager

JWT_SECRET=supersecretkey
```

## 11. Run Backend

### Local
```bash
npm install
npm run dev
```

### Docker
Mn project root:
```bash
docker compose up -d --build
```

Backend kaykhdem 3la:
- `http://localhost:5000`

## 12. Quick Test b curl

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Said\",\"email\":\"said@test.com\",\"password\":\"123456\"}"
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"said@test.com\",\"password\":\"123456\"}"
```

### Create task (b token)
```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d "{\"title\":\"Task 1\",\"description\":\"Demo\"}"
```

## 13. Notes Important

- Password kaytraja3 m3a user f register response (hashed). A7san production:
1. Matrj3ch password field.
2. Zid validation dyal input (email format, min password length, etc).
3. Zid centralized error handling.
4. St3ml migrations blast `sync()` f production.
