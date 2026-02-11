import { Router } from "express";
import { specialityController } from "./speciality.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";

const route=Router();
route.post('/',checkAuth(Role.DOCTOR),specialityController.createSpeciality);

export const specialityRoute=route;