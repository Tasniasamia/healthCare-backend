import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { validationRequest } from "../../middleware/validationRequest";
import { prescriptionSchema } from "./prescription.validation";
import { prescriptionController } from "./prescription.controller";

const router = Router();
router?.post(
  "/",
  checkAuth(Role.DOCTOR),
  validationRequest(prescriptionSchema.createPrescriptionSchema),
  prescriptionController.createPrescription
);
router.patch("/:id",checkAuth(Role.DOCTOR),prescriptionController.updatePrescription)

export const prescriptionRoutes=router;