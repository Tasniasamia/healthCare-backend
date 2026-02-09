import { prisma } from "../../lib/prisma"

const getAllDoctor=async()=>{
    return await prisma.doctor.findMany({})
}

export const doctorService={getAllDoctor}