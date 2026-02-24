import { Router, type NextFunction, type Request, type Response } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { patientController } from "./patient.controller";
import { validationRequest } from "../../middleware/validationRequest";
import { updatePatientProfileSchema } from "./patient.validation";
import { multerUpload } from "../../../config/multer.config";
import express from 'express';
import type { buffer } from "node:stream/consumers";
const router = Router();

router.patch(
  "/",
  checkAuth(Role.PATIENT),
  multerUpload.fields([
    { name: "profilePhoto", maxCount: 1 },
    { name: "medicalReport", maxCount: 5 },
  ]),
  (req: Request, res: Response,next:NextFunction) => {
    const payload=req?.body as any;
       const files = req.files as {[fieldName:string]:Express.Multer.File[]|undefined};

    if(files && typeof files === 'object' &&  files?.profilePhoto){
        payload.profilePhoto=files?.profilePhoto[0]?.path;
    }
    if(files && typeof files === 'object' && Array.isArray(files?.medicalReport) && files?.medicalReport?.length>0){
  const newReports=files?.medicalReport?.map((i)=>{
    return {
        reportName: i.originalname || `Medical Report - ${new Date().getTime()}`,
        reportLink: i?.path
    }
  });
  payload.medicalReport=[...payload?.medicalReport,...newReports]
    }
    console.log("req?.files",req?.files);
    req.body=payload;
    next()
  },
  validationRequest(updatePatientProfileSchema),
  patientController.updatePatientProfile
);

export const patientRoutes = router;
