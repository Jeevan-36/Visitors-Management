import {Router} from "express";
const router=Router();
import { registerUser,loginManager ,deactivateResident ,deactivateGuard,getResidentDetails,
    getGuardDetails
} from "../controllers/manager.controller.js";
import { verifyManager } from "../middlewares/manager.middleware.js";
import { getVisitsOnFilter } from "../controllers/user.controller.js";
router.route("/register").post(verifyManager,registerUser);
router.route("/login").post(loginManager);
router.route("/deactivate-resident").put(verifyManager,deactivateResident);
//think about again activating user
router.route("/deactivate-guard").put(verifyManager,deactivateGuard);
router.route("/residents-details").get(verifyManager,getResidentDetails);
router.route("/guards-details").get(verifyManager,getGuardDetails);
router.route("/search-log").post(verifyManager,getVisitsOnFilter)
export default router;