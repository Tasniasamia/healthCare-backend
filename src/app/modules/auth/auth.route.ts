import { Router } from "express";
import { AuthController } from "./auth.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post("/register", AuthController.registerPatient);
router.post("/login", AuthController.loginUser);
router.get(
  "/me",
  checkAuth(Role.ADMIN, Role.DOCTOR, Role.PATIENT, Role.SUPER_ADMIN),
  AuthController.getProfile
);
router.get('/refresh-token',AuthController.getNewToken);
export const AuthRoutes = router;
