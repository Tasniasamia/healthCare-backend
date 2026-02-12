import { prisma } from "../../lib/prisma";
import type { speciality } from "./speciality.interface";

const createSpeciality=async(payload:speciality)=>{
    const res=await prisma.specialty.create({
        data:{...payload}
    });
    return res;
}


export const specialityService={
    createSpeciality
}