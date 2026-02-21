import type { Request, Response } from "express";
import { catchAsyncHandler } from "../../shared/catchAsyncHandler";
import { scheduleService } from "./schedule.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { AppError } from "../../errorHelplers/appError";

const createSchedule = catchAsyncHandler( async (req : Request, res : Response) => {
    const payload = req.body;
    const schedule = await scheduleService.createSchedule(payload);
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

export const scheduleController = { createSchedule };
