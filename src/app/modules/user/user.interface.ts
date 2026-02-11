import type { Gender, Role, UserStatus } from "../../../generated/prisma/enums";

export interface TCreateDoctorPayload {
  password: string;
  doctor: {
    name: string;
    email: string;
    profilePhoto?: string;
    contactNumber: string;
    address?: string;
    registrationNumber: string;
    experience: number;
    gender: Gender;
    appointmentFee: number;
    qualification: string;
    currentWorkingPlace: string;
    designation: string;
    avaerageRating: number;
  };
  specialities: string[];
}

export interface TCreateAdminPayload {
  password: string;
  admin: {
    name: string;
    email: string;
    profilePhoto?: string;
    contactNumber: string;
  };
}

export interface TCreateSuperAdminPayload {
  password: string;
  superAdmin: {
    name: string;
    email: string;
    profilePhoto?: string;
    contactNumber: string;
  };
}
