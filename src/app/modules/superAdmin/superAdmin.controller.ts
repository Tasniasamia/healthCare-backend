import type { NextFunction, Request, Response } from "express";
import { catchAsyncHandler } from "../../shared/catchAsyncHandler";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { AppError } from "../../errorHelplers/appError";
import { superAdminService } from "./superAdmin.service";
import { SuperAdminScalarFieldEnum } from "../../../generated/prisma/internal/prismaNamespace";
import type { JwtPayload } from "jsonwebtoken";

const getAllSuperAdmin=catchAsyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
const {email,isDeleted}=req?.query;
    const result=await superAdminService.getAllSuperAdmin({email:email as string,isDeleted:Boolean(isDeleted)});
   return sendResponse(res,{
    httpStatusCode:status.OK,
    success:true,
    message:'Super Admin Retrived Successfully',
    data:result

   })
})
const getSuperAdminById=catchAsyncHandler(async(req:Request,res:Response)=>{
    const {id}=await req?.params;

    const result=await superAdminService.getSuperAdminById(id as string) ;
    if(!result){
        throw new Error("Super Admin doesn'st exist here");
    }
   return sendResponse(res, {
     httpStatusCode: status.OK,
     success: true,
     message: "Super Admin retrieved successfully",
     data: result,
   });})

   const updateSuperAdmin=catchAsyncHandler(async(req:Request,res:Response)=>{
    const payload=await req?.body;
    const {id}=req?.params;
    const result=await superAdminService.updateSuperAdmin(id as string,payload);
    sendResponse(res,{
        httpStatusCode:status.CREATED,
        success:true,
        message:"Super Admin updated successfully",
        data:result
        
    })
})

const deleteSuperAdmin=catchAsyncHandler(async(req:Request,res:Response)=>{
    const {id}=req?.params;
    const result=await superAdminService.deleteSuperAdmin(id as string);
    if(result){
return sendResponse(res,{
    httpStatusCode:status.CREATED,
    success:true,
    message:" User deleted successfully",
    data:result
    
})
    }
    throw new AppError(status.BAD_REQUEST,'Super Admin deletion failed')
    
})


export const superAdminController={getAllSuperAdmin,getSuperAdminById,updateSuperAdmin,deleteSuperAdmin}