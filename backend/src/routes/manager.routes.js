import {Router} from "express";
const router=Router();
import { registerUser,loginManager} from "../controllers/manager.controller.js";
import { verifyManager } from "../middlewares/manager.middleware.js";
import { getVisitsOnFilter } from "../controllers/user.controller.js";
router.route("/register").post(verifyManager,registerUser);
router.route("/login").post(loginManager);

router.route("/search-log").post(verifyManager,getVisitsOnFilter)
export default router;