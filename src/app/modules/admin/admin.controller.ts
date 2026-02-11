import type { NextFunction, Request, Response } from "express";
import { catchAsyncHandler } from "../../shared/catchAsyncHandler";
import { adminService } from "./admin.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { AppError } from "../../errorHelplers/appError";

const getAllAdmin=catchAsyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
const {email,isDeleted}=req?.query;
    const result=await adminService.getAllAdmin({email:email as string,isDeleted:Boolean(isDeleted)});
   return sendResponse(res,{
    httpStatusCode:status.OK,
    success:true,
    message:'Admin Retrived Successfully',
    data:result

   })
})
const getAdminById=catchAsyncHandler(async(req:Request,res:Response)=>{
    const {id}=await req?.params;

    const result=await adminService.getAdminById(id as string) ;
    if(!result){
        throw new Error("Admin doesn'st exist here");
    }
   return sendResponse(res, {
     httpStatusCode: status.OK,
     success: true,
     message: "Admin retrieved successfully",
     data: result,
   });})

   const updateAdmin=catchAsyncHandler(async(req:Request,res:Response)=>{
    const payload=await req?.body;
    const {id}=req?.params;
    const result=await adminService.updateAdmin(id as string,payload);
    sendResponse(res,{
        httpStatusCode:status.CREATED,
        success:true,
        message:"Admin updated successfully",
        data:result
        
    })
})

const deleteAdmin=catchAsyncHandler(async(req:Request,res:Response)=>{
    const payload=await req?.body;
    const {id}=req?.params;
    const result=await adminService.deleteAdmin(id as string);
    if(result){
return sendResponse(res,{
    httpStatusCode:status.CREATED,
    success:true,
    message:"Admin deleted successfully",
    data:result
    
})
    }
    throw new AppError(status.BAD_REQUEST,'Admin deletion failed')
    
})


export const adminController={getAllAdmin,getAdminById,updateAdmin,deleteAdmin}