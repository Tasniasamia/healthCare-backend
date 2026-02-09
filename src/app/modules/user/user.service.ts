import type { NextFunction } from "express";
import { Role, type Speciality } from "../../../generated/prisma/client";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import type { TCreateDoctorPayload } from "./user.interface";

const createDoctor = async (payload: TCreateDoctorPayload,next:NextFunction) => {
    
  const specialities: Speciality[] = [];
  for (let specialityId of payload.specialities) {
    const findSpeciality = await prisma.speciality.findUnique({
      where: { id: specialityId },
    });
    if (!findSpeciality) {
      throw new Error(`specialityId ${specialityId} doesn't exist here`);
    }
    specialities.push(findSpeciality);
  }
  console.log("specialiteis",specialities);
    const isUserExist = await prisma.user.findUnique({
      where: { email: payload?.doctor?.email },
    });
    if (isUserExist) {
      throw new Error(`User already exist as a ${isUserExist?.role}`);
    }

    const createUser = await auth.api.signUpEmail({
      body: {
        name: payload?.doctor?.name as string,
        email: payload?.doctor?.email as string,
        password: payload?.password,
        needPasswordChanges: true,
        role: Role.DOCTOR,
      },
    });
    if(!createUser?.user?.id){
        throw new Error('Failed to create doctor as user into user model');
    }
    try{
        
        const createDoctor=await prisma.$transaction(async(tx)=>{
           return await  tx.doctor.create({data:{...payload?.doctor,userId:createUser?.user?.id}});
        })
    
        if(createDoctor?.id){
            console.log("creating doctor");
            const createDoctorSpecialityPayload=specialities.map((speciality)=>{
                return {
                    doctorId:createDoctor?.id,specialityId:speciality?.id
                }
            })
            const createDoctorSpeciality=await prisma.doctorSpeciality.createMany({
                data:createDoctorSpecialityPayload
            })
            const findDoctorData=await prisma.doctor.findUnique({where:{id:createDoctor?.id},select:{id:true,name:true,email:true,address:true,appointmentFee:true,registrationNumber:true,avaerageRating:true,contactNumber:true,currentWorkingPlace:true,designation:true,specialities:true,user:true,profilePhoto:true,qualification:true,createAt:true,gender:true,experience:true}});
            return findDoctorData;

            
        }
    }
    catch(error){
        await prisma.user.delete({where:{id:createUser?.user?.id as string}});
        return ;
    }
  
};

export const userService = { createDoctor };
