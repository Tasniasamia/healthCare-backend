import type { Request, Response } from "express";
import { specialityService } from "./speciality.service";

 const createSpeciality=async(req:Request,res:Response)=>{
    try{
      const data=await req.body;
      console.log("data",await req.body);
      const response=await specialityService.createSpeciality(data);
      if(response){
      return  res.status(201).json({
        success:true,
        message:'Speciality Created Successfully',
        data:response
        });
      }
    }
    catch(error:any){
     throw new Error(error);
    }
 }

 export const specialityController={createSpeciality}