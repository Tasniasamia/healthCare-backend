import { Router } from "express";
import { specialityController } from "./speciality.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { multerUpload } from "../../../config/multer.config";
import { validationRequest } from "../../middleware/validationRequest";
import { SpecialtySchema } from "./speciality.validation";

const route=Router();
route.post('/',multerUpload.single("file"),validationRequest(SpecialtySchema.createSpecialtyZodSchema),specialityController.createSpeciality);

export const specialityRoute=route;