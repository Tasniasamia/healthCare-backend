import type { Gender } from "../../../generated/prisma/enums";

export interface TCreateDoctorPayload{
    password:string;
    doctor:{
        name:string;
        email:string;
        userId:string;
        profilePhoto?:string;
  contactNumber?:string;
  address?:string
  registrationNumber?:string
  experience :number;
  gender:Gender;
  appointmentFee:number;
  qualification :string;
  currentWorkingPlace:string;
  designation:string;
  avaerageRating:number;
},
specialities:string[]
}