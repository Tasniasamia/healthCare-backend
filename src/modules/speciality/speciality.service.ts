import { prisma } from "../../lib/prisma";
import type { speciality } from "./speciality.interface";

const createSpeciality=async(payload:speciality)=>{
    console.log("payload",payload);
    const res=await prisma.speciality.create({
        data:{...payload}
    });
    return res;
}


export const specialityService={
    createSpeciality
}