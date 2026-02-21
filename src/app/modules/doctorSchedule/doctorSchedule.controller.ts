import type { NextFunction, Request, Response } from "express";
import { doctorScheduleService } from "./doctorSchedule.service";
import status from "http-status";
import { AppError } from "../../errorHelplers/appError";
import { sendResponse } from "../../shared/sendResponse";
import  { catchAsyncHandler } from "../../shared/catchAsyncHandler";
import type { JwtPayload } from "jsonwebtoken";

const createDoctorSchedule = catchAsyncHandler( async (req : Request, res : Response) => {
    const payload = req.body;
    const schedule = await doctorScheduleService.createDoctorSchedule(req?.user as JwtPayload,payload);

    if(!schedule){
        throw new AppError(status.BAD_REQUEST,'Failed to create Schedule')
    }
    sendResponse(res, {
        success: true,
        httpStatusCode: status.CREATED,
        message: 'Schedule created successfully',
        data: schedule
    });
});
const udpateDoctorSchedule = catchAsyncHandler( async (req : Request, res : Response) => {
    const payload = req.body;
    const schedule = await doctorScheduleService.updateDoctorSchedule(req?.user as JwtPayload,payload);

    if(!schedule){
        throw new AppError(status.BAD_REQUEST,'Failed to update Schedule')
    }
    sendResponse(res, {
        success: true,
        httpStatusCode: status.OK,
        message: 'Schedule updated successfully',
        data: schedule
    });
});
export const doctorScheduleController={createDoctorSchedule,udpateDoctorSchedule}