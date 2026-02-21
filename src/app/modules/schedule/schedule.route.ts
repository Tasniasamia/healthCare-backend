import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { validationRequest } from "../../middleware/validationRequest";
import { scheduleSchema } from "./schedule.validation";
import { scheduleController } from "./schedule.controller";


const router = Router();

router.post('/', validationRequest(scheduleSchema.createScheduleSchema) , scheduleController.createSchedule);
router.get('/',scheduleController.getSchedule);
router.get('/:id', checkAuth(Role.ADMIN, Role.SUPER_ADMIN,Role.DOCTOR), scheduleController.getScheduleById);

router.patch('/:id', checkAuth(Role.ADMIN, Role.SUPER_ADMIN), validationRequest(scheduleSchema.createScheduleSchema), scheduleController.updateSchedule);
router.delete('/:id',checkAuth(Role.ADMIN, Role.SUPER_ADMIN),  scheduleController.deleteSchedule);

export const scheduleRoutes = router;