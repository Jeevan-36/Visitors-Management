# Visitor Management System — Project Documentation

---

## 1. Project Overview

This is a **full-stack MERN web application** for managing visitors in residential complexes and apartment societies. The system provides role-based access control with three distinct user roles: **Manager**, **Guard**, and **Resident**.

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19 + Vite + React Router |
| Backend | Express.js (Node.js) |
| Database | MongoDB (Mongoose ODM) |
| Real-time | Socket.io |
| Authentication | JWT + Sessions + bcrypt |
| UI Framework | Material UI (MUI) + Tailwind CSS |
| Deployment | Vercel |

---

## 2. User Roles

### 2.1 Manager (Admin)
- Dashboard with analytics and statistics
- Manage guards (add/remove)
- Manage residents (add/remove)
- View reports and visitor history

### 2.2 Guard (Security)
- Register visitors on entry
- Mark visitor exit
- View today's visits
- Generate reports

### 2.3 Resident
- Approve/deny visitor requests
- View visitor history
- View approval statistics

---

## 3. Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
│                   (React + Vite)                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Guards    │  │  Manager    │  │  Resident   │        │
│  │  Dashboard  │  │  Dashboard  │  │  Dashboard  │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP + Socket.io
┌──────────────────────────▼──────────────────────────────────┐
│                        BACKEND                              │
│                   (Express.js)                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Controllers│  │   Routes    │  │ Middlewares │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                      DATABASE                               │
│                    (MongoDB)                                 │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐          │
│  │  User  │  │ Visitor│  │  Visit │  │  Flat  │          │
│  └────────┘  └────────┘  └────────┘  └────────┘          │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Backend Structure

```
backend/src/
├── app.js              # Express app configuration
├── index.js            # Server entry point + Socket.io
├── constants.js        # App constants
├── controllers/
│   ├── guards.controller.js      # Guard-specific logic
│   ├── manager.controller.js     # Manager-specific logic
│   ├── resident.controller.js    # Resident-specific logic
│   └── user.controller.js        # Common user logic
├── models/
│   ├── user.models.js    # User schema (manager/guard/resident)
│   ├── visit.model.js    # Visit records schema
│   ├── visitors.model.js # Visitor details schema
│   └── flat.model.js     # Flat data schema
├── routes/
│   ├── guards.routes.js
│   ├── manager.routes.js
│   └── residents.routes.js
├── middlewares/
│   ├── guard.middleware.js
│   ├── manager.middleware.js
│   ├── resident.middleware.js
│   └── user.middleware.js
├── db/
│   └── index.js          # MongoDB connection
├── seeds/
│   ├── manager.seed.js
│   └── flats.seed.js
└── utils/
    ├── ApiError.js
    ├── ApiResponse.js
    └── asyncHandler.js
```

---

## 5. Frontend Structure

```
frontend/src/
├── App.jsx                    # Main router
├── main.jsx                   # Entry point
├── firebase.config.js         # Firebase configuration
├── index.css                  # Global styles
├── api/
│   └── axios.js               # Axios instance with interceptors
├── context/
│   └── UserContextProvider.jsx # React Context for user state
└── components/
    ├── Login.jsx
    ├── Register.jsx
    ├── LogoutModal.jsx
    ├── Settings.jsx
    ├── StatsSection.jsx
    ├── Guards/
    │   ├── AddVisitorModal.jsx
    │   ├── GuardDashboard.jsx
    │   ├── GuardReports.jsx
    │   ├── GuardVisits.jsx
    │   └── MarkExitModal.jsx
    ├── Manager/
    │   ├── ManageGuards.jsx
    │   ├── ManagerDashboard.jsx
    │   ├── ManageResidents.jsx
    │   └── ManagerReports.jsx
    └── Resident/
        ├── ResidentApprovals.jsx
        ├── ResidentDashboard.jsx
        ├── ResidentHistory.jsx
        └── ResidentStatsSection.jsx
```

---

## 6. Data Models

### 6.1 User Model

```javascript
{
  name: String,
  phoneNo: String (unique, 10 digits, Indian mobile),
  email: String (unique),
  password: String (hashed with bcrypt),
  role: "manager" | "guard" | "resident",
  flatNo: String (required for resident),
  employeeId: String (auto-generated for guard, e.g., "G-001"),
  refreshToken: String,
  isActive: Boolean (default: true)
}
```

### 6.2 Visitor Model

```javascript
{
  name: String,
  phoneNo: String,
  email: String (unique)
}
```

### 6.3 Visit Model

```javascript
{
  visitor: ObjectId → Visitor,
  resident: ObjectId → User,
  flatNo: String,
  status: "Pending" | "Approved" | "Denied" | "Exited",
  purpose: String,
  approvedGuardId: ObjectId → User,
  entryTime: Date,
  exitTime: Date
}
```

### 6.4 Flat Model

```javascript
{
  flatNumber: String,
  isOccupied: Boolean
}
```

---

## 7. Complete Workflow

### 7.1 User Registration (Manager)

```
Manager logs in
    │
    ▼
POST /manager/register-user
Body: { name, phoneNo, email, password, role, flatNo }
    │
    ├──► Validate all fields
    ├──► Check phone number uniqueness
    ├──► If resident: check flat not occupied
    ├──► If guard: auto-generate employeeId (G-001, G-002...)
    └──► Create user in MongoDB
```

### 7.2 Guard — Register Visitor

```
Guard logs in
    │
    ▼
POST /guard/register-visit
Body: { name, phoneNo, flatNo, purpose, email, employeeId }
    │
    ├──► Find resident by flatNo
    ├──► Find guard by employeeId
    ├──► Find or create visitor record
    ├──► Check no active visit exists
    ├──► Create Visit with status: "Pending"
    └──► Emit socket event to resident
```

### 7.3 Resident — Approval

```
GET /resident/pending
Returns: [{ visitor details, flatNo, purpose, entryTime }]
    │
    ▼
Resident clicks "Approve" or "Deny"
    │
    ├──► APPROVE: status → "Approved"
    │         Socket emit to guard
    │
    └──► DENY: status → "Denied"
```

### 7.4 Guard — Mark Exit

```
PUT /guard/mark-exit
Body: { visitId }
    │
    ▼
Visit.findByIdAndUpdate({
  exitTime: new Date(),
  status: "Exited"
})
```

---

## 8. Authentication Flow

### 8.1 Login Process

```
User enters phoneNo + password + role
    │
    ▼
POST /{role}/login
    │
    ├──► Find user by phoneNo + role
    ├──► bcrypt.compare(password, user.password)
    ├──► Generate JWT accessToken
    ├──► Generate JWT refreshToken
    └──► Save refreshToken in database
    │
    ▼
Response:
{
  user: { name, role, flatNo, ... },
  accessToken: "eyJhbGciOiJIUzI1Ni...",
  refreshToken: (HTTP-only cookie)
}
```

### 8.2 Request Authentication

```
Every protected request includes:
    │
    ├──► Authorization: Bearer {accessToken}
    └──► Cookie: refreshToken (HTTP-only)
    │
    ▼
verifyUser middleware:
    │
    ├──► Decode JWT
    ├──► Attach user to req.user
    └──► Pass to next middleware
    │
    ▼
Role-specific middleware:
    │
    ├──► Check req.user.role matches required role
    └──► Allow or deny access
```

---

## 9. API Endpoints

### 9.1 Guard Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/guard/login` | Guard login |
| POST | `/guard/register-visit` | Register new visitor |
| GET | `/guard/my-visits` | Get guard's visit history |
| PUT | `/guard/mark-exit` | Mark visitor exit |
| GET | `/guard/check-visitor` | Check if visitor exists |

### 9.2 Manager Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/manager/login` | Manager login |
| POST | `/manager/register-user` | Add guard/resident |
| GET | `/manager/all-guards` | List all guards |
| GET | `/manager/all-residents` | List all residents |
| DELETE | `/manager/delete-user/:id` | Remove user |
| GET | `/manager/reports` | View reports |

### 9.3 Resident Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/resident/login` | Resident login |
| GET | `/resident/pending` | Get pending approvals |
| PUT | `/resident/approve/:id` | Approve visitor |
| PUT | `/resident/deny/:id` | Deny visitor |
| GET | `/resident/history` | View visitor history |

### 9.4 Common Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/visitors-summary` | Visitor statistics |
| GET | `/recent-activity` | Recent activity feed |
| GET | `/flat-numbers` | List of flat numbers |
| POST | `/login-guest` | Guest login |
| PUT | `/update-profile` | Update user profile |
| PUT | `/change-password` | Change password |
| GET | `/logout` | Logout user |

---

## 10. Real-time Features (Socket.io)

### 10.1 Server-side Emission

```javascript
// When resident approves/denies
io.to(visit.approvedGuardId.employeeId).emit("resident-response", {
  updatedVisit
});
```

### 10.2 Client-side Listening

```javascript
// In GuardDashboard
socket.on("resident-response", (data) => {
  // Update visit status in real-time
  setVisits(prev => prev.map(v => 
    v._id === data.updatedVisit._id ? data.updatedVisit : v
  ));
});
```

---

## 11. Key Features Summary

- ✅ Role-based authentication (Manager/Guard/Resident)
- ✅ Visitor registration with purpose tracking
- ✅ Approval workflow (Pending → Approved/Denied)
- ✅ Exit time tracking
- ✅ Real-time notifications via Socket.io
- ✅ Profile and password management
- ✅ Flat number management
- ✅ Auto-generated employee IDs for guards
- ✅ Separate dashboards per role

---

## 12. Interview Talking Points

### Q: What was the most challenging part?
- Implementing role-based access control with separate dashboards
- Managing real-time updates between guards and residents via Socket.io
- Handling concurrent visit sessions (preventing duplicate entries)

### Q: How do you handle security?
- JWT + session cookies for authentication
- bcrypt for password hashing
- Role-specific middleware to protect routes
- HTTP-only cookies for refresh tokens

### Q: What improvements would you make?
- Add email/SMS notifications for visitor approvals
- Implement QR code-based visitor passes
- Add photo upload for visitors
- can include re active the de activated guards

### Q: What did you learn from this project?
- Full-stack MERN development
- RESTful API design
- MongoDB with Mongoose ODM
- React Context API for state management
- Real-time communication with Socket.io
- Deployment on Vercel

---

## 13. Project File Tree

```
Visitor Management/
├── .git/
├── .github/
├── backend/
│   ├── package.json
│   ├── vercel.json
│   └── src/
│       ├── app.js
│       ├── index.js
│       ├── constants.js
│       ├── controllers/
│       ├── middlewares/
│       ├── models/
│       ├── routes/
│       ├── seeds/
│       ├── db/
│       └── utils/
└── frontend/
    ├── package.json
    ├── vercel.json
    ├── vite.config.js
    ├── eslint.config.js
    ├── index.html
    ├── public/
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── firebase.config.js
        ├── index.css
        ├── api/
        ├── components/
        └── context/
```

---

*Document generated for interview preparation*
*Project: Visitor Management System*
*Date: April 2026*