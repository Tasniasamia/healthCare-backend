import { Router } from "express";
import { userController } from "./user.controller";

const router = Router()

router.post("/doctor", userController.createDoctor)


export const userRoutes = router;