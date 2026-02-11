import type { NextFunction, Request, Response } from "express";
import { UserStatus, type Role } from "../../generated/prisma/enums";
import { cookieUtils } from "../utils/cookie";
import { AppError } from "../errorHelplers/appError";
import status from "http-status";
import { prisma } from "../lib/prisma";
import { jwtUtils } from "../utils/jwt";
import { envVars } from "../../config/env";
import type { JwtPayload } from "jsonwebtoken";

export const checkAuth=(...AuthRole:Role[])=>{
    return async (req:Request,res:Response,next:NextFunction)=>{
        const sessionToken=await cookieUtils.getCookie(req,'better-auth.session_token');
        console.log("sessionToken",sessionToken);
        if(!sessionToken){
            throw new AppError(status.UNAUTHORIZED,'You are not authorized')
        }
        const sessionExist=await prisma.session.findFirst({
          where:{token:sessionToken,expiresAt:{gt:new Date()}},
          include:{user:true}
          
        })
        if(sessionExist?.user){
            let expireTime=new Date(sessionExist?.expiresAt).getTime();
            let createdTime=new Date(sessionExist?.createdAt).getTime();
            let totalTime=(expireTime-createdTime);
            let remainTime=(expireTime-Date.now());
            if(!remainTime){
                throw new AppError(status.UNAUTHORIZED,'Your session time has been expired')
            }

            if(sessionExist?.user?.status === (UserStatus.BLOCKED|| UserStatus.DELETED)){
                throw new AppError(status.UNAUTHORIZED,'You are not an active user. you are unathorized user')
            }
            if(sessionExist?.user?.isDeleted){
                throw new AppError(status.UNAUTHORIZED,'You are deleted User')
            }

        }

        const accessToken=await cookieUtils.getCookie(req,'accessToken');
        const accessTokenPayload= await jwtUtils.verifyToken(accessToken,envVars.ACCESS_TOKEN_SECRET);
       if(!accessTokenPayload?.success){
       throw new AppError(status.UNAUTHORIZED,accessTokenPayload?.message)
       }
       req.user=accessTokenPayload.data as JwtPayload;

        next();
    }
}