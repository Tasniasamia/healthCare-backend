import type { Request, Response } from "express";
import { catchAsyncHandler } from "../../shared/catchAsyncHandler";
import { userService } from "./user.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";

const createDoctor=catchAsyncHandler(async(req:Request,res:Response)=>{
const payload=await req.body;
const data=await userService.createDoctor(payload);
console.log("data",data);
if(data){
    return await  sendResponse(res,{   httpStatusCode:status.CREATED,
        success:true,
        message:'Doctor registred successfully',
        data:data})
   
}
 throw new Error("Doctor registration failed");
})
export const userController={createDoctor}