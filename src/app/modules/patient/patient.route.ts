import { Router, type NextFunction, type Request, type Response } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { patientController } from "./patient.controller";
import { validationRequest } from "../../middleware/validationRequest";
import { updatePatientProfileSchema } from "./patient.validation";
import { multerUpload } from "../../../config/multer.config";

const router = Router();

router.patch(
  "/",
  checkAuth(Role.PATIENT),
  multerUpload.fields([
    { name: "profilePhoto", maxCount: 1 },
    { name: "medicalReports", maxCount: 5 },
  ]),
  (req: Request, res: Response, next: NextFunction) => {
    const payload = JSON.parse(req.body.data); // ✅ parse first
  
    const files = req.files as {
      [fieldName: string]: Express.Multer.File[] | undefined;
    } | any;
  
    if (files?.profilePhoto) {
      payload.patientInfo.profilePhoto = files.profilePhoto[0].path ;
    }
  
    if (Array.isArray(files?.medicalReports) && files?.medicalReports.length > 0) {
        console.log("coming here");
      const newReports = files.medicalReports.map((i:any) => ({
        reportName:
          i.originalname || `Medical Report - ${new Date().getTime()}`,
        reportLink: i.path,
      }));
  
      payload.medicalReports = [
        ...(payload.medicalReports || []),
        ...newReports,
      ];
    }
  
    req.body = payload; // ✅ now it's object
    next();
  },
  validationRequest(updatePatientProfileSchema),
  patientController.updatePatientProfile
);

export const patientRoutes = router;
