import { Router } from "express";
import { doctorController } from "./doctor.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { doctorSchema } from "./doctor.validation";
import { validationRequest } from "../../middleware/validationRequest";

const route = Router();
route.get("/",checkAuth(Role.ADMIN,Role.SUPER_ADMIN),  doctorController.getAllDoctor);
route.get("/:id",checkAuth(Role.ADMIN,Role.SUPER_ADMIN),  doctorController.getDoctorById);
route.put(
  "/:id",
  validationRequest(doctorSchema.createUpdateDoctorSchema),
  checkAuth( Role.ADMIN, Role.SUPER_ADMIN),
  doctorController.updateDoctor
);
route.delete("/:id", checkAuth(Role.ADMIN,Role.SUPER_ADMIN), doctorController.deleteDoctor);

export const doctorRoutes = route;
