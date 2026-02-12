import type { NextFunction, Request, Response } from "express";
import { catchAsyncHandler } from "../../shared/catchAsyncHandler";
import { AuthService } from "./auth.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { cookieUtils } from "../../utils/cookie";
import { envVars } from "../../../config/env";
import { tokenUtils } from "../../utils/token";
import type { JwtPayload } from "jsonwebtoken";

const registerPatient = catchAsyncHandler(
  async (req: Request, res: Response) => {
    const payload = req.body;


    const result = await AuthService.registerPatient(payload);

    sendResponse(res, {
      httpStatusCode: status.CREATED,
      success: true,
      message: "Patient registered successfully",
      data: result,
    });
  }
);

const loginUser = catchAsyncHandler(async (req: Request, res: Response) => {
  const payload = req.body;
  const { data, accessToken, refreshToken, token } =
    await AuthService.loginUser(payload);

  tokenUtils.setGenerateAccessTokenCookie(res, accessToken);
  tokenUtils.setGenerateRereshTokenCookie(res, refreshToken);
  tokenUtils.setBetterAuthSessionCookie(res, token);

  return await sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "User logged in successfully",
    data: data,
  });
});

const getProfile=catchAsyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
const user=await req.user;
const result=await AuthService.getProfile(user as JwtPayload);
return await sendResponse(res, {
  httpStatusCode: status.OK,
  success: true,
  message: "Get profile successfully",
  data: result,
});
})




export const AuthController = {
  registerPatient,
  loginUser,
  getProfile
};
