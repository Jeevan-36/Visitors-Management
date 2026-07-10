import express, { urlencoded } from "express";
import cookieParser from "cookie-parser";
import session from "express-session";
import cors from "cors";

import guardRouter from './routes/guards.routes.js';
import managerRouter from './routes/manager.routes.js';
import residentRouter from './routes/residents.routes.js';
import { 
  getVisitorsSummary, 
  getFlatNumbers, 
  loginAsGuest, 
  getRecentVisitorActivity, 
  logoutUser, 
  updateProfile, 
  updatePassword 
} from "./controllers/user.controller.js";
import { verifyUser } from "./middlewares/user.middleware.js";

const app = express();

app.set("trust proxy", 1);

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://visitors-management-alpha.vercel.app"
  ],
  credentials: true
}));

app.use(express.json({ limit: "16kb" }));
app.use(urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
    },
  })
);
app.use('/guard', guardRouter);
app.use('/manager', managerRouter);
app.use('/resident', residentRouter);

app.get('/visitors-summary', getVisitorsSummary);
app.get('/recent-activity', getRecentVisitorActivity);
app.get('/flat-numbers', getFlatNumbers);
app.post('/login-guest', loginAsGuest);

app.get('/logout', verifyUser, logoutUser);
app.put('/update-profile', verifyUser, updateProfile);
app.put('/change-password', verifyUser, updatePassword);

app.use((err, req, res, next) => {
    console.error("ERROR:", {
        message: err.message,
        path: req.path,
        method: req.method
    });

    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error",
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined
    });
});

export { app };