import type { Request, Response } from "express";
import { catchAsyncHandler } from "../../shared/catchAsyncHandler";
import type { JwtPayload } from "jsonwebtoken";
import { reviewService } from "./review.service";
import { AppError } from "../../errorHelplers/appError";
import status from "http-status";
import { sendResponse } from "../../shared/sendResponse";
import { prisma } from "../../lib/prisma";
import { Role } from "../../../generated/prisma/enums";

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
const updateReview = catchAsyncHandler(async (req: Request, res: Response) => {
  const user = req?.user as JwtPayload;
  const payload = req?.body;
  const {id}=req?.params;
  const result = await reviewService.updateReview(id as string,user, payload);
  if (!result) {
    throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to update review");
  }
  return sendResponse(res, {
    success: true,
    httpStatusCode: status.OK,
    message: "You have updated review successfully",
    data: result,
  });
});

const deleteReview=catchAsyncHandler(async (req: Request, res: Response) => {
  const user = req?.user as JwtPayload;
  const {id}=req?.params;
  const result = await reviewService.deleteReview(id as string,user);
  if (!result) {
    throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to delete review");
  }
  return sendResponse(res, {
    success: true,
    httpStatusCode: status.OK,
    message: "You have deleted review successfully",
    data: result,
  });
});

const getAllReviews = catchAsyncHandler(async (req: Request, res: Response) => {

  const result = await reviewService.getAllReviews();
  sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: 'Reviews retrieval successfully',
      data: result
  });
});

const myReviews = catchAsyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await reviewService.myReviews(user);
  sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: 'Reviews retrieval successfully',
      data: result
  });

});


export const reviewController = { giveReview,updateReview,deleteReview,getAllReviews,myReviews };
