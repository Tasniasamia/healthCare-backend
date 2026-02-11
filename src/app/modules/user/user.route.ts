import { Router } from "express";
import { userController } from "./user.controller";
import { userValidationSchema } from "./user.validation";
import { validationRequest } from "../../middleware/validationRequest";

const router = Router();

router.post(
  "/create-doctor",
  validationRequest(userValidationSchema.CreateDoctorSchema),
  userController.createDoctor
);
router.post('/create-admin',validationRequest(userValidationSchema.CreateAdminSchema),userController.createAdmin);
router.post('/create-superAdmin',validationRequest(userValidationSchema.CreateSuperAdminSchema),userController.createSuperAdmin);

export const userRoutes = router;
