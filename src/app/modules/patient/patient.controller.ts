import type { Request, Response } from "express";
import  { catchAsyncHandler } from "../../shared/catchAsyncHandler";
import type { JwtPayload } from "jsonwebtoken";
import { patientService } from "./patient.service";
import { AppError } from "../../errorHelplers/appError";
import status from "http-status";
import { sendResponse } from "../../shared/sendResponse";

const updatePatientProfile=catchAsyncHandler(async(req:Request,res:Response)=>{
const user=req?.user as JwtPayload;
const payload=req?.body;
console.log("req?.files",req?.files);
const result=await patientService.updatePatientProfile(user,payload);
if(!result){
    throw new AppError(status.INTERNAL_SERVER_ERROR,'Failed to update patient profile');
}
return  sendResponse(res,{
    success:true,
    httpStatusCode:status.OK,
    message:'Patient profile updated successfully',
    data:result
})

});

export const patientController={
    updatePatientProfile
}