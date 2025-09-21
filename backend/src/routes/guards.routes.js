import {Router} from "express";
import { loginGuard, markEntry,markExit,getTodaysActivity} from "../controllers/guards.controller.js";
import {verifyGuard} from "../middlewares/guard.middleware.js"

const router=Router();
router.route("/login").post(loginGuard);
router.route("/mark-entry").post(verifyGuard,markEntry);
router.route("/mark-exit").post(verifyGuard,markExit);
router.route("/get-todays-visits").get(verifyGuard,getTodaysActivity);
export default router;