import express, { urlencoded } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";

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
  updatePassword,
  refreshAccessToken
} from "./controllers/user.controller.js";
import { verifyUser } from "./middlewares/user.middleware.js";

const app = express();

app.set("trust proxy", 1);

// Apply security headers
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

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

// Rate Limiter for sensitive routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per 15 mins
  message: { success: false, message: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/guard/login', authLimiter);
app.use('/manager/login', authLimiter);
app.use('/resident/login', authLimiter);
app.use('/login-guest', authLimiter);
app.use('/guard/send-email-otp', authLimiter);

app.use('/guard', guardRouter);
app.use('/manager', managerRouter);
app.use('/resident', residentRouter);

app.get('/visitors-summary', getVisitorsSummary);
app.get('/recent-activity', getRecentVisitorActivity);
app.get('/flat-numbers', getFlatNumbers);
app.post('/login-guest', loginAsGuest);
app.post('/refresh-token', refreshAccessToken);

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