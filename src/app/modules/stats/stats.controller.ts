
import status from "http-status";

import { sendResponse } from "../../shared/sendResponse";
import { catchAsyncHandler } from "../../shared/catchAsyncHandler";
import { statsService } from "./stats.service";
import type { Request, Response } from "express";
import type { JwtPayload } from "jsonwebtoken";


const getDashboardStatsData = catchAsyncHandler(async (req: Request, res: Response) => {
    const user = req.user as JwtPayload;
    const result = await statsService.getDashboardStatsData(user);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Stats data retrieved successfully!",
        data: result
    })
});

export const StatsController = {
    getDashboardStatsData
}