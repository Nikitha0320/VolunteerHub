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

Frontend starts on: `http://localhost:5173`

## Notes
- Backend is pre-configured for Aiven MySQL with SSL required.
- `ddl-auto=update` automatically creates/updates tables.
- No manual DB setup is required for connection configuration.
