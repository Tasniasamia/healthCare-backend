import type { NextFunction, Request, Response } from "express";
import { specialityService } from "./speciality.service";
import { catchAsyncHandler } from "../../shared/catchAsyncHandler";
import { sendResponse } from "../../shared/sendResponse";

 const createSpeciality= (catchAsyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
  const data=await req.body;
  const payload={...req.body,icon:req?.file?.path}
  const response=await specialityService.createSpeciality(payload);
  if(response){
  return await sendResponse(res,{
    success:true,
    message:'Speciality Created Successfully',
    data:response,
    httpStatusCode:201
    });
  }
 }))

 const getAllSpeciality= (catchAsyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
  const response=await specialityService.getAllSpeciality();
  if(response){
  return await sendResponse(res,{
    success:true,
    message:'Speciality get Successfully',
    data:response,
    httpStatusCode:200
    });
  }
 }))



 export const specialityController={getAllSpeciality,createSpeciality}