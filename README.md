# Visitor Management System

A full-stack MERN application designed to simplify visitor management in residential apartments and gated communities. The system provides secure visitor registration, role-based access, and real-time visitor approval between guards and residents.

## Features

- Role-based authentication and authorization
- Visitor entry and exit management
- Real-time approval workflow using Socket.io
- Dashboard for each user role
- Visitor history and reports
- Profile and password management

## User Roles

### Manager
- Manage Guards and Residents
- View visitor analytics and reports
- Activate/Deactivate Guards

### Guard
- Register new visitors
- Mark visitor exit
- View visitor records
- Receive real-time approval updates

### Resident
- Approve or deny visitor requests
- View visitor history
- Track visitor statistics

## Tech Stack

### Frontend
- React.js
- Vite
- Tailwind CSS
- React Router
- Axios

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Express Session
- Socket.io
- bcrypt

## Deployment

- Frontend: Vercel
- Backend: Vercel
- Database: MongoDB Atlas
