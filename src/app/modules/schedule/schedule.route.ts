import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { validationRequest } from "../../middleware/validationRequest";
import { scheduleSchema } from "./schedule.validation";
import { scheduleController } from "./schedule.controller";


const router = Router();

router.post('/',  validationRequest(scheduleSchema.createScheduleSchema) , scheduleController.createSchedule);
export const scheduleRoutes = router;