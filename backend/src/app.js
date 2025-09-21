import express, { urlencoded } from "express";
import cookieParser from "cookie-parser";

import cors from "cors";
const app=express();

app.use(cookieParser());
app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173", 
  credentials: true              
}));
app.use(urlencoded({
    extended: true
})) 

import guardRouter from './routes/guards.routes.js';
import managerRouter from './routes/manager.routes.js';
import residentRouter from './routes/residents.routes.js'
app.use('/guard',guardRouter);
app.use('/manager',managerRouter);
app.use('/resident',residentRouter);
import { getVisitorsSummary } from "./controllers/user.controller.js";
app.get('/visitors-summary',getVisitorsSummary); 
import { getRecentVisitorActivity } from "./controllers/user.controller.js";
app.get('/recent-activity', getRecentVisitorActivity);
import {verifyUser} from "./middlewares/user.middleware.js";
import { logoutUser } from "./controllers/user.controller.js";
app.get('/logout',verifyUser,logoutUser);

export {
    app
}