import type { NextFunction, Request, RequestHandler, Response } from "express";

export const catchAsyncHandler=(functionHandler:RequestHandler)=>{

    return async(req:Request,res:Response,next:NextFunction)=>{
        try{
          await functionHandler(req,res,next);
        }
        catch(error:any){
           await res.status(500).json({
                success:false,
                message:"Failed to create speciality",
                error:error
            })
            
        }
    }

  }  


