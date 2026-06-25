# CitizenConnect

A web-based platform for citizens to register complaints, track their status, and communicate with government departments. Admins manage complaints, assign them to departments, update statuses, and view reports.

## Features
- **Citizens:** register/login, file complaints, track status, view update threads
- **Admins:** view all complaints, manage departments, assign complaints to departments, view reports (by status / by department)
- **Department Staff:** view complaints assigned to their department, post status updates and comments
- JWT-based authentication with role-based access (CITIZEN, ADMIN, DEPARTMENT_STAFF)

## Tech Stack
- **Backend:** Spring Boot 3.3, Spring Security, Spring Data JPA, MySQL, JWT (jjwt)
- **Frontend:** React 18, React Router, Axios

---

## 1. Backend Setup

### Prerequisites
- Java 17+
- Maven
- MySQL running locally

### Steps
1. Create the database (or let it auto-create):
   ```sql
   CREATE DATABASE citizenconnect_db;
   ```
2. Open `backend/src/main/resources/application.properties` and update:
   ```properties
   spring.datasource.username=root
   spring.datasource.password=YOUR_MYSQL_PASSWORD
   ```
3. Run the app:
   ```bash
   cd backend
   mvn spring-boot:run
   ```
4. Backend runs at: `http://localhost:8080`

Tables auto-create via `spring.jpa.hibernate.ddl-auto=update`.

---

## 2. Frontend Setup

### Prerequisites
- Node.js 18+ and npm

### Steps
```bash
cd frontend
npm install
npm start
```
Frontend runs at: `http://localhost:3000`

---

## 3. Using the App

1. **First, create at least one Department.** Register an ADMIN account, log in, go to "Departments", and add a few (e.g. Sanitation, Roads, Water Supply).
2. Register a CITIZEN account, log in, and file a complaint.
3. As ADMIN, go to "Complaints", expand a complaint, and assign it to a department.
4. Register a DEPARTMENT_STAFF account (selecting that department during registration), log in, and post status updates on assigned complaints.
5. The citizen can log back in and see the update thread and status change in real time.
6. ADMIN can view aggregate stats under "Reports".

**Note:** Since department selection during DEPARTMENT_STAFF registration depends on departments existing, create departments (as ADMIN) before registering staff accounts.

---

## API Endpoints (for reference)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register a new user |
| POST | /api/auth/login | Login, returns JWT |
| GET | /api/departments | List departments (public) |
| POST/PUT/DELETE | /api/departments | Manage departments |
| GET/POST | /api/complaints | List (role-scoped) / file a complaint |
| PUT | /api/complaints/{id}/assign | Assign complaint to a department |
| GET/POST | /api/complaints/{id}/updates | View / post status updates |
| DELETE | /api/complaints/{id} | Delete a complaint |
| GET | /api/complaints/reports/status-summary | Counts by status |
| GET | /api/complaints/reports/department-summary | Counts by department |

All endpoints except `/api/auth/**` and `GET /api/departments` require header:
```
Authorization: Bearer <token>
```

## Project Structure
```
citizenconnect/
├── backend/      # Spring Boot REST API
└── frontend/     # React app
```
