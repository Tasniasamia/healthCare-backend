import type { DoctorSchedulesInclude} from "../../../generated/prisma/models";

export const doctorScheduleSearchableFields = [
  "scheduleId",
  "doctorId",
  "isBooked",
  "schedule.startDateTime",
  "schedule.endDateTime",
  "schedule.appointments.status",
  "schedule.appointments.paymentStatus",
];
export const doctorSchedulefilterableFields = [
  "scheduleId",
  "doctorId",
  "isBooked",
  "schedule.startDateTime",
  "schedule.endDateTime",
  "schedule.appointments.status",
  "schedule.appointments.paymentStatus",
];

export const createdoctorSchduleConfig : Partial<Record<keyof DoctorSchedulesInclude, DoctorSchedulesInclude[keyof DoctorSchedulesInclude]>> ={
    doctor: {
        include:{appointments:true}
    },
    schedule: true

}
export const createdoctorSchduledefaultIncludeConfig:string[]=[
    'doctor','schedule'

]

