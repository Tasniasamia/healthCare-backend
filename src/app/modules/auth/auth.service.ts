import { Role, UserStatus } from "../../../generated/prisma/enums";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";


interface IRegisterPatientPayload {
    name: string;
    email: string;
    password: string;
}

const registerPatient = async (payload: IRegisterPatientPayload) => {
    const { name, email, password } = payload;

    const data = await auth.api.signUpEmail({
        body: {
            name,
            email,
            password,
            role: Role.PATIENT
        }
    })

    if (!data.user) {
        throw new Error("Failed to register patient");
    }
    let patientTx;
   try{
     patientTx=await prisma.$transaction(async(tx)=>{
        return await tx.patient.create({data:{name:name,email:email,userId:data?.user?.id}});
      });
   }
   catch(error:any){
    await prisma.user.delete({where:{id:data?.user?.id}});
    throw Error(error);

   }
 return {...data?.user,...patientTx}
}

interface ILoginUserPayload {
    email: string;
    password: string;
}

const loginUser = async (payload: ILoginUserPayload) => {
    const { email, password } = payload;

    const data = await auth.api.signInEmail({
        body: {
            email,
            password,
        }
    })

    if (data.user.status === UserStatus.BLOCKED) {
        throw new Error("User is blocked");
    }

    if (data.user.isDeleted || data.user.status === UserStatus.DELETED) {
        throw new Error("User is deleted");
    }

    return data;

}

export const AuthService = {
    registerPatient,
    loginUser,
};