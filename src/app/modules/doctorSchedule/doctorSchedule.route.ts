import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { doctorScheduleController } from "./doctorSchedule.controller";
import { validationRequest } from "../../middleware/validationRequest";
import { doctorscheduleSchema } from "./doctorSchedule.validation";


const router = Router();

router.post('/',checkAuth(Role.DOCTOR),validationRequest(doctorscheduleSchema.createDoctorScheduleSchema), doctorScheduleController.createDoctorSchedule);
router.patch('/',checkAuth(Role.DOCTOR),validationRequest(doctorscheduleSchema.updateDoctorScheduleSchema), doctorScheduleController.udpateDoctorSchedule);

export const doctorscheduleRoutes = router;