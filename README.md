# Visitor Management System

A full-stack, secure **MERN** (MongoDB, Express, React 19, Node.js) web application designed to manage and monitor visitors in residential complexes and gated communities. 

The system implements a role-based access control architecture with three distinct user portals: **Manager (Admin)**, **Guard (Security)**, and **Resident**. It features real-time notifications via **Socket.io** and secure, database-backed stateless email OTP verification.

---

## Key Features

*   👥 **Role-Based Dashboards:** Separate user flows and interfaces for Residents, Guards, and Managers.
*   🔒 **Robust Security Architecture:**
    *   **Anti-IDOR (Insecure Direct Object Reference) Protection:** Route requests check and enforce verified JWT context fields (`req.user`) instead of trusting payload properties sent from the client.
    *   **Authenticated Real-Time Sockets:** Socket.io connections are authenticated with JWT access tokens. Strict checks prevent clients from joining unauthorized notification rooms (such as another resident's flat number).
    *   **Secure Access Tokens & Rotation:** Short-lived access tokens combined with secure HTTP-only refresh tokens. Features automatic Axios token-refresh interceptors.
    *   **HTTP Security Headers & Limiters:** Integrated `helmet` middleware and `express-rate-limit` to prevent brute-forcing login or OTP APIs.
*   ⚡ **Stateless & Serverless Friendly:** Session-free architecture utilizing database-backed collections for OTP verifications, fully compatible with horizontal scaling and **Vercel Serverless Functions**.
*   📧 **OTP Email Verification:** Secure 6-digit email OTPs to verify visitor registrations before granting entry.
*   📱 **Responsive Responsive Layouts:** Optimized for mobile phones, tablets, and desktops using responsive grids and scrollable tables.

---

## Tech Stack

*   **Frontend:** React 19, Vite, React Router, Tailwind CSS, Material UI (MUI), Socket.io Client, Axios.
*   **Backend:** Express.js, Node.js, Socket.io, JWT (jsonwebtoken), nodemailer, express-rate-limit, helmet.
*   **Database:** MongoDB Atlas (Mongoose ODM).

---

## Project Structure

```text
Visitor Management/
├── backend/
│   ├── src/
│   │   ├── app.js               # Express application configuration
│   │   ├── index.js             # Server startup & socket listeners
│   │   ├── controllers/         # Request handling logic
│   │   ├── middlewares/         # JWT verification & role validation
│   │   ├── models/              # User, Visit, Visitor, and Otp schemas
│   │   ├── routes/              # Express routing definitions
│   │   ├── db/                  # MongoDB Atlas connection setup
│   │   └── seeds/               # Database seed scripts
│   ├── vercel.json              # Vercel deployment configuration
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── main.jsx             # React entry point & routing configuration
    │   ├── App.jsx              # Main parent layout
    │   ├── api/
    │   │   └── axios.js         # Custom Axios instance with interceptors
    │   ├── context/
    │   │   └── UserContextProvider.jsx  # Auth context state
    │   └── components/          # Portal dashboard elements
    ├── vercel.json              # Frontend Vercel configuration
    └── package.json
```

---

## Environment Configuration

Create a `.env` file inside the `backend` directory:

```env
PORT=8000
MONGODB_URI=your_mongodb_connection_string
ACCESS_TOKEN_SECRET=your_jwt_access_secret
ACCESS_TOKEN_EXPIRE=15m
REFRESH_TOKEN_SECRET=your_jwt_refresh_secret
REFRESH_TOKEN_EXPIRE=7d
EMAIL=your_gmail_address
EMAIL_PASSWORD=your_gmail_app_password
NODE_ENV=development
```

Create a `.env` file inside the `frontend` directory:

```env
VITE_API_URL=http://localhost:8000
```

---

## Installation & Local Setup

### 1. Backend Setup
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Initialize the database seed data (Creates default flats list and a default Manager account):
   ```bash
   npm run seed
   ```
4. Start the server in development mode:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Navigate to the frontend folder:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```

Open `http://localhost:5173` in your browser.

---

## Deployment to GitHub & Production

### 1. Backend (Serverless on Vercel)
This backend is fully stateless and matches Vercel serverless criteria:
*   Ensure all environment variables listed above are configured in your Vercel Project Settings.
*   Ensure `cors` and Socket.io origins are configured to match your production frontend URL.

### 2. Frontend
*   Build the application bundle:
    ```bash
    npm run build
    ```
*   Set the `VITE_API_URL` environment variable to match the deployed backend server address in Vercel.
