import type { NextFunction, Request, Response } from "express";
import { catchAsyncHandler } from "../../shared/catchAsyncHandler";
import { AuthService } from "./auth.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { cookieUtils } from "../../utils/cookie";
import { envVars } from "../../../config/env";
import { tokenUtils } from "../../utils/token";
import type { JwtPayload } from "jsonwebtoken";
import { AppError } from "../../errorHelplers/appError";
import type { TChangePasswordPayload } from "./auth.interface";

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
});

const getNewToken=catchAsyncHandler(async(req:Request,res:Response)=>{
const getSessionToken=await cookieUtils.getCookie(req,'better-auth.session_token')
const getRefreshToken=await cookieUtils.getCookie(req,'refreshToken');

if(!getRefreshToken){
  throw new AppError(status.UNAUTHORIZED,'Refreshtoken is missing');
}
const result=await AuthService.getNewToken(getRefreshToken,getSessionToken);
if(!result){
  throw new Error("Failed to generate access token by refresh token");
}
const {accessToken,refreshToken,token}= result;
tokenUtils.setGenerateAccessTokenCookie(res, accessToken);
tokenUtils.setGenerateRereshTokenCookie(res, refreshToken);
tokenUtils.setBetterAuthSessionCookie(res, token);
sendResponse(res, {
  httpStatusCode: status.OK,
  success: true,
  message: "New tokens generated successfully",
  data: {
      accessToken,
      refreshToken,
      sessionToken:token,
  },
});
})

const changePassword=catchAsyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
  const payload=await req?.body as TChangePasswordPayload;
  const getSessionToken=await cookieUtils.getCookie(req,'better-auth.session_token')

  const { data, accessToken, refreshToken, token } =
    await AuthService.changePassword(payload,getSessionToken);

  tokenUtils.setGenerateAccessTokenCookie(res, accessToken);
  tokenUtils.setGenerateRereshTokenCookie(res, refreshToken);
  tokenUtils.setBetterAuthSessionCookie(res, token as string);  
  if(data){
    return sendResponse(res,{
      success:true,
      httpStatusCode:status.OK,
      message: "password changed successfully",
      data: data,
    })
  }

})

const logOut=catchAsyncHandler(async(req:Request,res:Response,)=>{
  const sessionToken=await cookieUtils.getCookie(req,'better-auth.session_token')
  const result=await AuthService.logOut(res,sessionToken);
  return await sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "User logged out successfully",
    data: result,
  });
})


const verifyEmail=catchAsyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
const payload=await req?.body as {email:string,otp:string}
const result=await AuthService.verifyEmail(payload );
return sendResponse(res,{
  httpStatusCode: status.OK,
  success: true,
  message: "Email verified successfully",
  data: result,
})
});

const requestPasswordReset=catchAsyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
  const {email}=await req?.body as {email:string}
  const result=await AuthService.requestPasswordReset(email);
  if(result){
   return await sendResponse(res,{
      httpStatusCode: status.OK,
      success: true,
      message: "Please eheck your OTP into your email",
      data: result,
    });
  }
})

const resetPasswordReset=catchAsyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
const payload=await req?.body as {email:string,otp:string,password:string}
const result=await AuthService.resetPassword(payload);
await sendResponse(res,{
  httpStatusCode: status.OK,
  success: true,
  message: "password reset Successfully",
  data: result,
})
})




export const AuthController = {
  registerPatient,
  loginUser,
  getProfile,
  getNewToken,
  changePassword,
  logOut,
  verifyEmail,
  requestPasswordReset,
  resetPasswordReset
};
