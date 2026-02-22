import type { AppointmentStatus } from "../../../generated/prisma/enums"

export interface ICreateBookAppointment{
    doctorId:string,
    schduleId:string,
}
