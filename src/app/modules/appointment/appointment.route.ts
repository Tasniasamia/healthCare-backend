import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { validationRequest } from "../../middleware/validationRequest";
import route from "../../routes";
import { appointmentSchema } from "./appointment.validation";
import { appointmentController } from "./appointment.controller";


const router = Router();

router.post('/',checkAuth(Role.PATIENT),validationRequest(appointmentSchema.bookAppointmentSchema), appointmentController.bookAppointment);

export const appointmentRoutes = router;