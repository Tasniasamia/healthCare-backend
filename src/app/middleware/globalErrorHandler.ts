import type { NextFunction, Request, Response } from "express";
import status from "http-status";
import { envVars } from "../../config/env";

export const globalErrorHandler=async(error:any,req:Request,res:Response,next:NextFunction)=>{
    let message:string='Internal Server Error';
    let httpStatusCode:number=status.INTERNAL_SERVER_ERROR;
    if(envVars.NODE_ENV !== 'Production'){
        console.log("Error from global error handler",error);
    }
    return await res.status(httpStatusCode).json({
        success:false,
        message:message,
        error:error?.message
    })
}