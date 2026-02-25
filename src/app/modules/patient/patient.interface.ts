import type { BloodGroup, Gender } from "../../../generated/prisma/enums";

export interface UserProfileInfo {
  name?: string;
  image?: string;
}

export interface PatientProfileInfo {
  name?: string;
  profilePhoto?: string;
  contactNumber?: string;
  address?: string;
}

export interface PatientHealthDataInfo {
  gender: Gender;
  dateOfBirth: string;
  bloodGroup: BloodGroup;
  hasAllergies?: boolean;
  hasDiabetes?: boolean;
  height: string;
  weight: string;
  smokingStatus?: boolean;
  dietaryPreferences?: string;
  pregnancyStatus?: boolean;
  mentalHealthHistory?: string;
  immunizationStatus?: string;
  hasPastSurgeries?: boolean;
  recentAnxiety?: boolean;
  recentDepression?: boolean;
  maritalStatus?: string;
  patientId?: string;
}

export interface reportInfo {
  reportName?: string;
  reportLink?: string;
  shouldDelete?: boolean;
  reportId?:string
}


export interface IUpdatePatientProfile {
    user:UserProfileInfo,
    patientInfo:PatientProfileInfo,
    patientHealth:PatientHealthDataInfo
    medicalReports:reportInfo[]
}
