import type { Gender } from "../../../generated/prisma/enums";

export interface TSpecialitestype{
  specilitiesId:string,
  shouldDelete?:boolean
}

export interface TUpdateDoctorPayload {
  userId?:string,
  name?: string;
  email?: string;
  profilePhoto?: string;
  contactNumber?: string;
  address?: string;
  registrationNumber?: string;
  experience?: number;
  gender?: Gender;
  appointmentFee?: number;
  qualification?: string;
  currentWorkingPlace?: string;
  designation?: string;
  avaerageRating?: number;
  specialities?: TSpecialitestype[];
}
