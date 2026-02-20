import type { Request, Response } from "express";
import { catchAsyncHandler } from "../../shared/catchAsyncHandler";
import { scheduleService } from "./schedule.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";

const createSchedule = catchAsyncHandler( async (req : Request, res : Response) => {
    const payload = req.body;
    const schedule = await scheduleService.createSchedule(payload);
    sendResponse(res, {
        success: true,
        httpStatusCode: status.CREATED,
        message: 'Schedule created successfully',
        data: schedule
    });
});

export const scheduleController = { createSchedule };
