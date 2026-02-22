import type { AppointmentInclude } from "../../../generated/prisma/models";

export const patientSearchableFields = [
  "id",
  "status",
  "paymentStatus",
  "videoCallingId",
  "patientId",
  "scheduleId",
  "patient.name",
  "patient.email",
  "patient.useId",
  "doctor.name",
  "doctor.email",
  "doctor.gender",
];

export const patientFilterableFields = [
  "id",
  "status",
  "paymentStatus",
  "videoCallingId",
  "patientId",
  "scheduleId",
  "patient.name",
  "patient.email",
  "patient.useId",
  "doctor.name",
  "doctor.email",
  "doctor.gender",
];

export const doctorSearchableFields = [
  "id",
  "status",
  "paymentStatus",
  "videoCallingId",
  "patientId",
  "scheduleId",
  "patient.name",
  "patient.email",
  "patient.useId",
  "doctor.name",
  "doctor.email",
  "doctor.gender",
];
export const doctorFilterableFields = [
  "id",
  "status",
  "paymentStatus",
  "videoCallingId",
  "patientId",
  "scheduleId",
  "patient.name",
  "patient.email",
  "patient.useId",
  "doctor.name",
  "doctor.email",
  "doctor.gender",
];

export const patientConfig: Partial<
  Record<keyof AppointmentInclude, AppointmentInclude[keyof AppointmentInclude]>
> = {
  doctor: true,
  prescription: true,
  review: true,
  payment: true,
};


export const patientDefaultConfig:string[]=[
    'doctor','prescription','review','payment'
]

export const doctorConfig: Partial<
  Record<keyof AppointmentInclude, AppointmentInclude[keyof AppointmentInclude]>
> = {
  patient: true,
  prescription: true,
  review: true,
  payment: true,
};


export const doctorDefaultConfig:string[]=[
    'patient','prescription','review','payment'
]


export const appointmentConfig: Partial<
  Record<keyof AppointmentInclude, AppointmentInclude[keyof AppointmentInclude]>
> = {
  doctor:true,
  patient: true,
  prescription: true,
  review: true,
  payment: true,
};