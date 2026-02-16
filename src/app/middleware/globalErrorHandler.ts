import type { NextFunction, Request, Response } from "express";
import status from "http-status";
import { envVars } from "../../config/env";
import z from "zod";
import type { TErrorSources } from "../interfaces/error.interface";
import { handleZodError } from "../errorHelplers/handleZodError";
import { AppError } from "../errorHelplers/appError";
import { deleteFileFromCloudinary } from "../../config/cloude.config";

export const globalErrorHandler = async (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let success = false;
  let errorSources: TErrorSources[] = [];
  let message: string = "Internal Server Error";
  let stack:string=''
//   let message: string = `Internal Server Error.${error?.message}`;
 let httpStatusCode: number = status.INTERNAL_SERVER_ERROR;
  if (envVars.NODE_ENV === "Development") {
    console.log("Error from global error handler", error);
  }

  if (error instanceof z.ZodError) {
    const simplifiedError = await handleZodError(error);
    success = simplifiedError?.success;
    message = simplifiedError?.message;
    httpStatusCode = simplifiedError?.statusCode as number;
    errorSources = [...simplifiedError.errorSources];
  }
  else if(error instanceof AppError){
       if(req.file){
        await deleteFileFromCloudinary(req.file.path)
    }

    if(req.files && Array.isArray(req.files) && req.files.length > 0){
        const imageUrls = req.files.map((file) => file.path);
        await Promise.all(imageUrls.map(url => deleteFileFromCloudinary(url))); 
    }
    message = error?.message;
    httpStatusCode = error?.statusCode;
    stack=error?.stack as string
    errorSources = [{
        path:'/',
        message:error?.message
    }];
  }
  else if(error instanceof Error){
    message = error?.message;
    httpStatusCode=status.INTERNAL_SERVER_ERROR
    stack=error?.stack as string
    errorSources = [{
        path:'/',
        message:error?.message
    }];
  }



  return await res.status(httpStatusCode).json({
    success: false,
    message: message,
    error: error?.message,
    errorSources:(envVars.NODE_ENV === 'development')?errorSources:undefined,
    stack:(envVars.NODE_ENV === 'development')?stack:undefined
  });
};
