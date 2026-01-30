import express, { urlencoded } from "express";
import cookieParser from "cookie-parser";
import session from "express-session";
import cors from "cors";
const app=express();
app.set("trust proxy", 1);
app.use(cookieParser());
app.use(express.json());
app.use(cors({
  origin: ["http://localhost:5173",
    "https://visitors-management-alpha.vercel.app"
  ], 
  credentials: true              
}));
app.use(urlencoded({
    extended: true
})) 
app.use(
  session({
    secret: process.env.SESSION_SECRET || "defaultsecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 10 * 60 * 1000
    }
  })
);

import guardRouter from './routes/guards.routes.js';
import managerRouter from './routes/manager.routes.js';
import residentRouter from './routes/residents.routes.js'
app.use('/guard',guardRouter);
app.use('/manager',managerRouter);
app.use('/resident',residentRouter);
import { getVisitorsSummary,getFlatNumbers, loginAsGuest } from "./controllers/user.controller.js";
app.get('/visitors-summary',getVisitorsSummary); 
import { getRecentVisitorActivity } from "./controllers/user.controller.js";
app.get('/recent-activity', getRecentVisitorActivity);
import {verifyUser} from "./middlewares/user.middleware.js";
import { logoutUser } from "./controllers/user.controller.js";
import { updateProfile,updatePassword } from "./controllers/user.controller.js";
app.get('/logout',verifyUser,logoutUser);
app.get('/flat-numbers',getFlatNumbers);
app.put('/update-profile',verifyUser,updateProfile);
app.put('/change-password',verifyUser,updatePassword);
app.post('/login-guest',loginAsGuest);
// Error Handling Middleware
app.use((err, req, res, next) => {
    // Log the full error to your Render dashboard logs
    console.error("DEBUG ERROR LOG:", {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        cookies: req.cookies // Check if cookies are actually arriving
    });

    const statusCode = err.statusCode || 500;
    
    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error",
        // Only show stack trace in development mode
        stack: process.env.NODE_ENV === "development" ? err.stack : "🥞"
    });
});
export {
    app
}