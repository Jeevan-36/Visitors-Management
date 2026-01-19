import {Router} from "express";
import { loginGuard, markEntry,markExit,getTodaysActivity,checkVisitor} from "../controllers/guards.controller.js";
import {verifyGuard} from "../middlewares/guard.middleware.js"
import { sendEmailOtp, verifyEmailOtp,getVisitsOnFilter } from "../controllers/user.controller.js";

const router=Router();
router.route("/login").post(loginGuard);
router.route("/check-visitor").post(verifyGuard,checkVisitor);
router.route("/mark-entry").post(verifyGuard,markEntry);
router.route("/mark-exit").post(verifyGuard,markExit);
router.route("/get-todays-visits").get(verifyGuard,getTodaysActivity);
router.route("/send-email-otp").post(verifyGuard,sendEmailOtp);
router.route("/verify-email-otp").post(verifyGuard,verifyEmailOtp);
router.route("/search-log").post(verifyGuard,getVisitsOnFilter)
export default router;