import type { Request, Response } from "express";
import { catchAsyncHandler } from "../../shared/catchAsyncHandler";
import { doctorService } from "./doctor.service";
import status from "http-status";
import { sendResponse } from "../../shared/sendResponse";
import { AppError } from "../../errorHelplers/appError";
import type { IQueryParams } from "../../interfaces/query.interface";

const getAllDoctor=catchAsyncHandler(async(req:Request,res:Response)=>{
   const result=await doctorService.getAllDoctor(req?.query as IQueryParams) ;
   sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Doctors retrieved successfully",
    data: result?.data,
    meta:result?.meta
  });});

  const getDoctorById=catchAsyncHandler(async(req:Request,res:Response)=>{
    const {id}=await req?.params;

    const result=await doctorService.getDoctorById(id as string) ;
    if(!result){
        throw new Error("Doctor doesn'st exist here");
    }
   return sendResponse(res, {
     httpStatusCode: status.OK,
     success: true,
     message: "Doctors retrieved successfully",
     data: result,
   });})

const updateDoctor=catchAsyncHandler(async(req:Request,res:Response)=>{
    const payload=await req?.body;
    console.log('payload',await req?.body);
    const {id}=req?.params;
    const result=await doctorService.updateDoctor(id as string,payload);
    sendResponse(res,{
        httpStatusCode:status.CREATED,
        success:true,
        message:"Doctor updated successfully",
        data:result
        
    })
})
const deleteDoctor=catchAsyncHandler(async(req:Request,res:Response)=>{
    const payload=await req?.body;
    const {id}=req?.params;
    const result=await doctorService.deleteDoctor(id as string);
    if(result){
return sendResponse(res,{
    httpStatusCode:status.CREATED,
    success:true,
    message:"Doctor deleted successfully",
    data:result
    
})
    }
    throw new AppError(status.BAD_REQUEST,'Doctor deletion failed')
    
})

export const doctorController={getAllDoctor,getDoctorById,updateDoctor,deleteDoctor}