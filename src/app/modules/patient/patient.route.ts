import { Router, type NextFunction, type Request, type Response } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { patientController } from "./patient.controller";
import { validationRequest } from "../../middleware/validationRequest";
import { updatePatientProfileSchema } from "./patient.validation";
import { multerUpload } from "../../../config/multer.config";
import { updateMyPatientProfileMiddleware } from "./patient.middleware";

const router = Router();

router.patch(
  "/",
  checkAuth(Role.PATIENT),
  multerUpload.fields([
    { name: "profilePhoto", maxCount: 1 },
    { name: "medicalReports", maxCount: 5 },
  ]),
  updateMyPatientProfileMiddleware,
  validationRequest(updatePatientProfileSchema),
  patientController.updatePatientProfile
);

export const patientRoutes = router;
