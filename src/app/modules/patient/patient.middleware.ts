import type { NextFunction, Request, Response } from "express";

export const updateMyPatientProfileMiddleware= (req: Request, res: Response, next: NextFunction) => {
    const payload = JSON.parse(req?.body?.data); // ✅ parse first
  
    const files = req?.files as {
      [fieldName: string]: Express.Multer.File[] | undefined;
    } | any;
  
    if (files?.profilePhoto) {
      payload.patientInfo.profilePhoto = files.profilePhoto[0].path ;
    }
  
    if (Array.isArray(files?.medicalReports) && files?.medicalReports.length > 0) {
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
  }