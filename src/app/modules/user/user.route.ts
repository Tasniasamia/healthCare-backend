import { Router } from "express";
import { userController } from "./user.controller";
import { userValidationSchema } from "./user.validation";
import { validationRequest } from "../../middleware/validationRequest";

const router = Router()

router.post("/create-doctor",validationRequest(userValidationSchema.CreateDoctorSchema),userController.createDoctor);


export const userRoutes = router;