import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { doctorScheduleController } from "./doctorSchedule.controller";
import { validationRequest } from "../../middleware/validationRequest";
import { doctorscheduleSchema } from "./doctorSchedule.validation";
import route from "../../routes";


const router = Router();

router.post('/',checkAuth(Role.DOCTOR),validationRequest(doctorscheduleSchema.createDoctorScheduleSchema), doctorScheduleController.createDoctorSchedule);
router.patch('/',checkAuth(Role.DOCTOR),validationRequest(doctorscheduleSchema.updateDoctorScheduleSchema), doctorScheduleController.udpateDoctorSchedule);
router.get('/public',checkAuth(Role.ADMIN,Role.SUPER_ADMIN),doctorScheduleController.getDoctorSchedule);
router.get('/my_schedule',checkAuth(Role.DOCTOR),doctorScheduleController.getMySchedule);
router.get("/:doctorId/doctor/:scheduleId",doctorScheduleController.getDoctorScheduleById);
router.delete("/:schduleId",checkAuth(Role.DOCTOR),doctorScheduleController.deleteMyDoctorSchedule)
export const doctorscheduleRoutes = router;