import type { NextFunction, Request, Response } from "express";
import status from "http-status";
import { AppError } from "../../errorHelplers/appError";
import { sendResponse } from "../../shared/sendResponse";
import { catchAsyncHandler } from "../../shared/catchAsyncHandler";
import type { JwtPayload } from "jsonwebtoken";
import { appointmentService } from "./appointment.service";


const bookAppointment = catchAsyncHandler(
  async (req: Request, res: Response) => {
    const payload = req.body;
    const result = await appointmentService.bookAppointment(
      req?.user as JwtPayload,
      payload
    );

    if (!result) {
      throw new AppError(status.BAD_REQUEST, "Failed to create appointment");
    }
    sendResponse(res, {
      success: true,
      httpStatusCode: status.CREATED,
      message: "Appointment create successfully",
      data: result,
    });
  }
);
const changeAppointmentStatus=catchAsyncHandler(
    async (req: Request, res: Response) => {
        
    })




export const appointmentController = {
  bookAppointment,changeAppointmentStatus

};
