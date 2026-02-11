import { Router } from "express";
import { adminController } from "./admin.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { adminSchema } from "./admin.validation";
import { validationRequest } from "../../middleware/validationRequest";

const route=Router();
route.get('/',adminController.getAllAdmin);
route.get('/:id',adminController.getAdminById);
route.put('/:id',validationRequest(adminSchema.updateAdminSchema),checkAuth(Role.ADMIN,Role.SUPER_ADMIN),adminController.updateAdmin);
route.delete("/:id", checkAuth(Role.ADMIN,Role.SUPER_ADMIN), adminController.deleteAdmin);
export const adminRoutes=route;