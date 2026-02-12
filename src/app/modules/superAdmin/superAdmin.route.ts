import { Router } from "express";
// import { adminController } from "./admin.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
// import { adminSchema } from "./admin.validation";
import { validationRequest } from "../../middleware/validationRequest";
import { superAdminController } from "./superAdmin.controller";
import { superAdminSchema } from "./superAdmin.validation";

const route=Router();
route.get('/',superAdminController.getAllSuperAdmin);
route.get('/:id',superAdminController.getSuperAdminById);
route.put('/:id',validationRequest(superAdminSchema.updateSuperAdminSchema),checkAuth(Role.ADMIN,Role.SUPER_ADMIN),superAdminController.updateSuperAdmin);
route.delete("/:id", checkAuth(Role.SUPER_ADMIN), superAdminController.deleteSuperAdmin);
export const superAdminRoutes=route;