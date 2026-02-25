import type { Request, Response } from "express";
import  { catchAsyncHandler } from "../../shared/catchAsyncHandler";
import { prescriptionService } from "./prescription.service";
import type { JwtPayload } from "jsonwebtoken";
import { AppError } from "../../errorHelplers/appError";
import status from "http-status";
import { sendResponse } from "../../shared/sendResponse";

const createPrescription = catchAsyncHandler(async (req: Request, res: Response) => {
    const user = req?.user as JwtPayload;
    const payload = req?.body;
    const result = await prescriptionService.createPrescription(user, payload);
    if (!result) {
      throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to create prescription");
    }
    return sendResponse(res, {
      success: true,
      httpStatusCode: status.OK,
      message: "You have send prescription successfully",
      data: result,
    });
  });

export const prescriptionController={
    createPrescription
}