import { Router } from "express";
import { AuthController } from "./auth.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { authValidationSchema } from "./auth.validation";
import { validationRequest } from "../../middleware/validationRequest";

const router = Router();

router.post("/register", AuthController.registerPatient);
router.post("/login", AuthController.loginUser);
router.get(
  "/me",
  checkAuth(Role.ADMIN, Role.DOCTOR, Role.PATIENT, Role.SUPER_ADMIN),
  AuthController.getProfile
);
router.get("/refresh-token", AuthController.getNewToken);
router.post(
  "/changePassword",
  validationRequest(authValidationSchema.changePasswordSchema),
  AuthController.changePassword
);
router.get("/logOut",checkAuth(Role.ADMIN, Role.DOCTOR, Role.PATIENT, Role.SUPER_ADMIN), AuthController.logOut);
router.post("/verify-email",AuthController.verifyEmail);
router.post("/sendOtp",AuthController.requestPasswordReset);
router.post("/resetPassword",AuthController.resetPasswordReset);
export const AuthRoutes = router;
