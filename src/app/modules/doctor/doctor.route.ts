import { Router } from "express";
import { doctorController } from "./doctor.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";


const route=Router();
route.get('/',doctorController.getAllDoctor);
route.get('/:id',doctorController.getDoctorById);
route.put('/:id',checkAuth(Role.DOCTOR),doctorController.updateDoctor)
route.delete('/:id',checkAuth(Role.DOCTOR),doctorController.deleteDoctor)

export const doctorRoutes=route;