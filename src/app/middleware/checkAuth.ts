import type { NextFunction, Request, Response } from "express";
import type { Role } from "../../generated/prisma/enums";
import { cookieUtils } from "../utils/cookie";
import { AppError } from "../errorHelplers/appError";
import status from "http-status";
import { prisma } from "../lib/prisma";

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
        console.log('sessionExist',sessionExist)
        next();
    }
}