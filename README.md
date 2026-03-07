# Volunteer Service Management System

Full stack web application connecting volunteers with social service events.

## Tech Stack

### Frontend
- React + Vite
- Axios
- React Router
- Tailwind CSS

### Backend
- Spring Boot (Maven)
- Spring Web
- Spring Data JPA
- Spring Security + JWT
- Lombok

### Database
- MySQL on Aiven Cloud

## Project Structure

```
volunteer/
├─ backend/
│  ├─ pom.xml
│  └─ src/main/
│     ├─ java/com/vms/backend/
│     │  ├─ config/
│     │  ├─ controller/
│     │  ├─ dto/
│     │  ├─ entity/
│     │  ├─ repository/
│     │  ├─ security/
│     │  ├─ service/
│     │  └─ VolunteerServiceManagementSystemApplication.java
│     └─ resources/
│        └─ application.properties
└─ frontend/
   ├─ package.json
   ├─ vite.config.js
   ├─ tailwind.config.js
   └─ src/
      ├─ components/
      ├─ layouts/
      ├─ pages/
      ├─ routes/
      └─ services/
```

## Environment Variables (Required)

This project uses environment variables for secrets. Do not commit real credentials to GitHub.

### Backend (`backend`)

Create `backend/.env` from `backend/.env.example` and set these values:

```text
SPRING_DATASOURCE_URL=jdbc:mysql://<host>:<port>/<db>?ssl-mode=REQUIRED
SPRING_DATASOURCE_USERNAME=<db_username>
SPRING_DATASOURCE_PASSWORD=<db_password>
APP_JWT_SECRET=<long_random_secret>
APP_JWT_EXPIRATION_MS=86400000
```

Run backend from `backend/` using either command:

```powershell
./run-backend.ps1 -Port 8080
# or
mvn spring-boot:run
```

`./run-backend.ps1` loads `backend/.env` for you.
If you run `mvn spring-boot:run` directly, set env vars in your shell first.

### Frontend (`frontend`)

Create `frontend/.env` for local development:

```text
VITE_API_BASE_URL=http://localhost:8080/api
```

For Render frontend deployment, set:

```text
VITE_API_BASE_URL=https://<your-backend-service>.onrender.com/api
```

## Core Features

### Volunteer
- Register and login
- View all events and event details
- View roles for each event
- Join event with selected role
- View joined events
- Cancel participation
- View organizer announcements

### Organizer
- Create / update / delete events
- Add volunteer roles to events
- View registered volunteers for event
- Post event announcements/messages

### Admin
- View all users
- Delete users

## Database Schema

### `users`
- `id` (PK)
- `name`
- `email` (unique)
- `password`
- `role` (`VOLUNTEER`, `ORGANIZER`, `ADMIN`)

### `events`
- `id` (PK)
- `title`
- `description`
- `location`
- `date` (`event_date` in entity)
- `time` (`event_time` in entity)
- `organizer_id` (FK -> users.id)
- `max_volunteers`

### `volunteer_roles`
- `id` (PK)
- `event_id` (FK -> events.id)
- `role_name`
- `role_description`
- `volunteers_required`

### `participation`
- `id` (PK)
- `volunteer_id` (FK -> users.id)
- `event_id` (FK -> events.id)
- `role_id` (FK -> volunteer_roles.id)
- `status` (`JOINED`, `CANCELLED`)

### `event_messages`
- `id` (PK)
- `event_id` (FK -> events.id)
- `organizer_id` (FK -> users.id)
- `message`
- `created_at`

## REST API Endpoints

Base URL: `http://localhost:8080/api`

### Authentication
- `POST /auth/register`
- `POST /auth/login`

### Events
- `GET /events`
- `GET /events/{id}`
- `GET /events/organizer/my` (ORGANIZER)
- `POST /events` (ORGANIZER)
- `PUT /events/{id}` (ORGANIZER)
- `DELETE /events/{id}` (ORGANIZER)

### Volunteer Roles
- `GET /events/{eventId}/roles`
- `POST /events/{eventId}/roles` (ORGANIZER)

### Participation
- `POST /participation/join` (VOLUNTEER)
- `PUT /participation/cancel/{eventId}` (VOLUNTEER)
- `GET /participation/my-events` (VOLUNTEER)
- `GET /participation/event/{eventId}` (ORGANIZER/ADMIN)

### Event Messages
- `GET /events/{eventId}/messages` (VOLUNTEER/ORGANIZER/ADMIN)
- `POST /events/{eventId}/messages` (ORGANIZER)

### Admin
- `GET /admin/users` (ADMIN)
- `DELETE /admin/users/{id}` (ADMIN)

## Sample API Requests and Responses

### 1) Register
`POST /api/auth/register`

Request:
```json
{
  "name": "Nikita",
  "email": "nikita@example.com",
  "password": "Password@123",
  "role": "VOLUNTEER"
}
```

Response:
```json
{
  "token": "<jwt_token>",
  "userId": 1,
  "name": "Nikita",
  "email": "nikita@example.com",
  "role": "VOLUNTEER"
}
```

### 2) Login
`POST /api/auth/login`

Request:
```json
{
  "email": "nikita@example.com",
  "password": "Password@123"
}
```

Response:
```json
{
  "token": "<jwt_token>",
  "userId": 1,
  "name": "Nikita",
  "email": "nikita@example.com",
  "role": "VOLUNTEER"
}
```

### 3) Create Event (Organizer)
`POST /api/events`

Headers:
- `Authorization: Bearer <jwt_token>`

Request:
```json
{
  "title": "Beach Cleanup",
  "description": "Weekend beach cleanup drive",
  "location": "Marina Beach",
  "eventDate": "2026-03-15",
  "eventTime": "07:30:00",
  "maxVolunteers": 100
}
```

Response:
```json
{
  "id": 10,
  "title": "Beach Cleanup",
  "description": "Weekend beach cleanup drive",
  "location": "Marina Beach",
  "eventDate": "2026-03-15",
  "eventTime": "07:30:00",
  "maxVolunteers": 100
}
```

### 4) Join Event (Volunteer)
`POST /api/participation/join`

Request:
```json
{
  "eventId": 10,
  "roleId": 4
}
```

Response:
```json
{
  "id": 21,
  "status": "JOINED"
}
```

### 5) Post Event Message (Organizer)
`POST /api/events/10/messages`

Request:
```json
{
  "message": "Event starts at 7:00 AM. Please report 15 mins early."
}
```

Response:
```json
{
  "id": 3,
  "message": "Event starts at 7:00 AM. Please report 15 mins early.",
  "createdAt": "2026-03-04T10:30:00"
}
```

## Run Instructions

## Prerequisites
- Java 17+
- Maven 3.9+
- Node.js 18+

### 1) Run Backend

```bash
cd backend
mvn spring-boot:run
```

Backend starts on: `http://localhost:8080`

## Deploy To GitHub And Render

### 1) Push To GitHub

Run from project root (`volunteer/`):

```powershell
git init
git add .
git commit -m "Initial deploy-ready setup"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

### 2) Backend Service On Render (Web Service)

Use these Render settings:

- Root Directory: `backend`
- Build Command: `mvn clean package -DskipTests`
- Start Command: `java -jar target/backend-0.0.1-SNAPSHOT.jar`

Set Render Environment Variables:

- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `APP_JWT_SECRET`
- `APP_JWT_EXPIRATION_MS=86400000`
- `APP_CORS_ALLOWED_ORIGINS=https://<your-frontend>.onrender.com,http://localhost:5173`

Notes:

- `server.port` is already mapped to Render port via `PORT` env fallback.
- Do not put secrets in files; keep them only in Render Environment.

### 3) Frontend Service On Render (Static Site)

Use these Render settings:

- Root Directory: `frontend`
- Build Command: `npm ci && npm run build`
- Publish Directory: `dist`

Set Render Environment Variable:

- `VITE_API_BASE_URL=https://<your-backend>.onrender.com/api`

### 4) Final Check

- Open frontend Render URL.
- Register/login.
- Verify API calls succeed in browser Network tab.

### 2) Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend starts on: `http://localhost:5173`

## Notes
- Backend is pre-configured for Aiven MySQL with SSL required.
- `ddl-auto=update` automatically creates/updates tables.
- No manual DB setup is required for connection configuration.
