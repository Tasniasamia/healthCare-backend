import type { NextFunction, Request, Response } from "express";
import { doctorScheduleService } from "./doctorSchedule.service";
import status from "http-status";
import { AppError } from "../../errorHelplers/appError";
import { sendResponse } from "../../shared/sendResponse";
import { catchAsyncHandler } from "../../shared/catchAsyncHandler";
import type { JwtPayload } from "jsonwebtoken";
import type { IQueryParams } from "../../interfaces/query.interface";

const createDoctorSchedule = catchAsyncHandler(
  async (req: Request, res: Response) => {
    const payload = req.body;
    const schedule = await doctorScheduleService.createDoctorSchedule(
      req?.user as JwtPayload,
      payload
    );

    if (!schedule) {
      throw new AppError(status.BAD_REQUEST, "Failed to create Schedule");
    }
    sendResponse(res, {
      success: true,
      httpStatusCode: status.CREATED,
      message: "Schedule created successfully",
      data: schedule,
    });
  }
);

const getDoctorSchedule = catchAsyncHandler(
  async (req: Request, res: Response) => {
    const result = await doctorScheduleService.getDoctorSchedule(
      req?.query as IQueryParams
    );

    sendResponse(res, {
      success: true,
      httpStatusCode: status.OK,
      message: "Schedule updated successfully",
      data: result?.data,
      meta: result?.meta,
    });
  }
);

const getMySchedule = catchAsyncHandler(async (req: Request, res: Response) => {
  const result = await doctorScheduleService.getMySchedule(
    req?.query as IQueryParams,
    req?.user as JwtPayload
  );

  sendResponse(res, {
    success: true,
    httpStatusCode: status.OK,
    message: "Schedule updated successfully",
    data: result?.data,
    meta: result?.meta,
  });
});


const getDoctorScheduleById=catchAsyncHandler(async (req: Request, res: Response) => {
    const result = await doctorScheduleService.getDoctorScheduleById(
        req?.params as IQueryParams,
       
      );
    
      sendResponse(res, {
        success: true,
        httpStatusCode: status.OK,
        message: "Schedule get successfully",
        data: result?.data[0] as any,
      });
})

const udpateDoctorSchedule = catchAsyncHandler(
  async (req: Request, res: Response) => {
    const payload = req.body;
    const schedule = await doctorScheduleService.updateDoctorSchedule(
      req?.user as JwtPayload,
      payload
    );

    if (!schedule) {
      throw new AppError(status.BAD_REQUEST, "Failed to update Schedule");
    }
    sendResponse(res, {
      success: true,
      httpStatusCode: status.OK,
      message: "Schedule updated successfully",
      data: schedule,
    });
  }
);


const deleteMyDoctorSchedule = catchAsyncHandler(
  async (req: Request, res: Response) => {
  const id = req.params.schduleId;
  const user = req.user;
 const result= await doctorScheduleService.deleteMyDoctorSchedule(id as string, user);
if(!result){
  throw new AppError(status.BAD_REQUEST,'Failed to delete Doctor schedule')
}
  sendResponse(res, {
      success: true,
      httpStatusCode: status.OK,
      message: 'Doctor schedule deleted successfully',
  });
});
export const doctorScheduleController = {
  createDoctorSchedule,
  udpateDoctorSchedule,
  getDoctorSchedule,
  getMySchedule,
  getDoctorScheduleById,
  deleteMyDoctorSchedule
};
