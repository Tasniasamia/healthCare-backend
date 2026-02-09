import { Router } from "express";
import { specialityController } from "./speciality.controller";

const route=Router();
route.post('/',specialityController.createSpeciality);

export const specialityRoute=route;