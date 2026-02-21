import type { Request, Response } from "express";
import { catchAsyncHandler } from "../../shared/catchAsyncHandler";
import { scheduleService } from "./schedule.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { AppError } from "../../errorHelplers/appError";
import type { IQueryParams } from "../../interfaces/query.interface";

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

const getSchedule=catchAsyncHandler( async (req : Request, res : Response) => {
    const result=await scheduleService.getSchedule(req?.query as IQueryParams)
    sendResponse(res, {
        success: true,
        httpStatusCode: status.OK,
        message: 'Schedule gets successfully',
        data: result?.data,
        meta:result?.meta
    });
});
const getScheduleById = catchAsyncHandler( async (req : Request, res : Response) => {
    const { id } = req.params;
    const schedule = await scheduleService.getScheduleById(id as string);
    sendResponse(res, {
        success: true,
        httpStatusCode: status.OK,
        message: 'Schedule retrieved successfully',
        data: schedule
    });
});
const updateSchedule = catchAsyncHandler( async (req : Request, res : Response) => {
    const { id } = req.params;
    const payload = req.body;
    const updatedSchedule = await scheduleService.updateSchedule(id as string, payload);
    if(!updatedSchedule){
        throw new AppError(status.BAD_REQUEST,'Failed to update Schedule')
 
    }
    sendResponse(res, {
        success: true,
        httpStatusCode: status.OK,
        message: 'Schedule updated successfully',
        data: updatedSchedule
    });
});

const deleteSchedule = catchAsyncHandler( async (req : Request, res : Response) => {
    const { id } = req.params;
    await scheduleService.deleteSchedule(id as string);
    sendResponse(res, {
        success: true,
        httpStatusCode: status.OK,
        message: 'Schedule deleted successfully',
        
    });
}
);



export const scheduleController = { createSchedule,getSchedule,getScheduleById ,updateSchedule,deleteSchedule};
