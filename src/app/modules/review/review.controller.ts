import type { Request, Response } from "express";
import { catchAsyncHandler } from "../../shared/catchAsyncHandler";
import type { JwtPayload } from "jsonwebtoken";
import { reviewService } from "./review.service";
import { AppError } from "../../errorHelplers/appError";
import status from "http-status";
import { sendResponse } from "../../shared/sendResponse";

const giveReview = catchAsyncHandler(async (req: Request, res: Response) => {
  const user = req?.user as JwtPayload;
  const payload = req?.body;
  const result = await reviewService.giveReview(user, payload);
  if (!result) {
    throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to give review");
  }
  return sendResponse(res, {
    success: true,
    httpStatusCode: status.OK,
    message: "You have reviewed successfully",
    data: result,
  });
});

export const reviewController = { giveReview };
