import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { validationRequest } from "../../middleware/validationRequest";
import route from "../../routes";
import { appointmentSchema } from "./appointment.validation";
import { appointmentController } from "./appointment.controller";

const router = Router();

router.post(
  "/",
  checkAuth(Role.PATIENT),
  validationRequest(appointmentSchema.bookAppointmentSchema),
  appointmentController.bookAppointment
);
router.patch(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.DOCTOR, Role.PATIENT),
  appointmentController.changeAppointmentStatus
);
router.get(
  "/my_appointment",
  checkAuth(Role.PATIENT, Role.DOCTOR),
  appointmentController.getMyAppointment
);
router.get(
    "/",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    appointmentController.getMyAppointment
  );
  router.get(
    "/:id",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.DOCTOR, Role.PATIENT),
    appointmentController.getBySingleId
  ); 

export const appointmentRoutes = router;
