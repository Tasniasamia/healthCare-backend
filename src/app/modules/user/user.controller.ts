import type { Request, Response } from "express";
import { catchAsyncHandler } from "../../shared/catchAsyncHandler";
import { userService } from "./user.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";

const createDoctor = catchAsyncHandler(async (req: Request, res: Response) => {
  const payload = await req.body;
  const data = await userService.createDoctor(payload);
  if (data) {
    return await sendResponse(res, {
      httpStatusCode: status.CREATED,
      success: true,
      message: "Doctor registred successfully",
      data: data,
    });
  }
  throw new Error("Doctor registration failed");
});

const createAdmin = catchAsyncHandler(async (req: Request, res: Response) => {
  const payload = await req.body;
  const data = await userService.createAdmin(payload);
  if (data) {
    return await sendResponse(res, {
      httpStatusCode: status.CREATED,
      success: true,
      message: "Admin registred successfully",
      data: data,
    });
  }
  throw new Error("Admin registration failed");
});

const createSuperAdmin = catchAsyncHandler(
  async (req: Request, res: Response) => {
    const payload = await req.body;
    const data = await userService.createSuperAdmin(payload);
    if (data) {
      return await sendResponse(res, {
        httpStatusCode: status.CREATED,
        success: true,
        message: "Super Admin registred successfully",
        data: data,
      });
    }
    throw new Error("Super Admin registration failed");
  }
);

export const userController = { createDoctor, createAdmin, createSuperAdmin };
