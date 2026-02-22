import type { NextFunction, Request, Response } from "express";
import status from "http-status";
import { AppError } from "../../errorHelplers/appError";
import { sendResponse } from "../../shared/sendResponse";
import { catchAsyncHandler } from "../../shared/catchAsyncHandler";
import type { JwtPayload } from "jsonwebtoken";
import { appointmentService } from "./appointment.service";
import type { IQueryParams } from "../../interfaces/query.interface";

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
const changeAppointmentStatus = catchAsyncHandler(
  async (req: Request, res: Response) => {
    const { id } = await req?.params;
    const result = await appointmentService.changeAppointmentStatus(
      id as string,
      req?.user,
      req?.body
    );
    if(!result){
        throw new AppError(status.INTERNAL_SERVER_ERROR,'Failed to Update Status')
    }
    sendResponse(res, {
        success: true,
        httpStatusCode: status.CREATED,
        message: "Appointment status updated successfully",
        data: result,
      });
  }
);

const getMyAppointment= catchAsyncHandler(async (req: Request, res: Response) => {
const result=await appointmentService.getMyAppointment(req?.user,req?.query as IQueryParams)
sendResponse(res, {
    success: true,
    httpStatusCode: status.CREATED,
    message: "Appointments get successfully",
    data: result?.data,
    meta:result?.meta

  });


});

const getAllAppointment= catchAsyncHandler(async (req: Request, res: Response) => {
    const result=await appointmentService.getAllAppointment(req?.query as IQueryParams)
    sendResponse(res, {
        success: true,
        httpStatusCode: status.CREATED,
        message: "Appointments get successfully",
        data: result?.data,
        meta:result?.meta
    
      });
    
    
    });

 const getBySingleId= catchAsyncHandler(async (req: Request, res: Response) => {
    const {id}=await req?.params;
    const result= await appointmentService.getBySingleId(req?.query as IQueryParams,id as string);
    sendResponse(res, {
        success: true,
        httpStatusCode: status.CREATED,
        message: "Appointments get successfully",
        data: result?.data as any,
    
      });
 })
export const appointmentController = {
  bookAppointment,
  changeAppointmentStatus,
  getMyAppointment,
  getAllAppointment,
  getBySingleId
};
