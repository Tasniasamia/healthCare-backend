import type { NextFunction, Request, Response } from "express";
import status from "http-status";
import { envVars } from "../../config/env";
import z, { success } from "zod";
import type { TErrorSources } from "../interfaces/error.interface";
import { handleZodError } from "../errorHelplers/handleZodError";

export const globalErrorHandler = async (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let success = false;
  let errorSources: TErrorSources[] = [];
  let message: string = "Internal Server Error";
//   let message: string = `Internal Server Error.${error?.message}`;
 let httpStatusCode: number = status.INTERNAL_SERVER_ERROR;
  if (envVars.NODE_ENV !== "Production") {
    console.log("Error from global error handler", error);
  }

  if (error instanceof z.ZodError) {
    const simplifiedError = await handleZodError(error);
    success = simplifiedError?.success;

    message = simplifiedError?.message;
    httpStatusCode = simplifiedError?.statusCode as number;
    errorSources = [...simplifiedError.errorSources];
    console.log("error issues", error.issues);
  }

  return await res.status(httpStatusCode).json({
    success: false,
    message: message,
    errorSources,
    error: error?.message,
  });
};
