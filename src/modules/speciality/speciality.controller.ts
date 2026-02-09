import type { NextFunction, Request, Response } from "express";
import { specialityService } from "./speciality.service";
import { catchAsyncHandler } from "../../utils/catchAsyncHandler";
import { sendResponse } from "../../utils/sendResponse";

 const createSpeciality= (catchAsyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
  const data=await req.body;
  console.log("data",await req.body);
  const response=await specialityService.createSpeciality(data);
  if(response){
  return await sendResponse(res,{
    success:true,
    message:'Speciality Created Successfully',
    data:response,
    httpStatusCode:201
    });
  }
 }))


 export const specialityController={createSpeciality}