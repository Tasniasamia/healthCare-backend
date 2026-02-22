import { randomUUID } from "crypto";
import { prisma } from "../../lib/prisma";
import type { JwtPayload } from "jsonwebtoken";
import type { ICreateBookAppointment } from "./appointment.interface";
import { Role, AppointmentStatus } from "../../../generated/prisma/enums";
import { AppError } from "../../errorHelplers/appError";
import status from "http-status";

const bookAppointment = async (
  user: JwtPayload,
  payload: ICreateBookAppointment
) => {
  const patient = await prisma.patient.findUniqueOrThrow({
    where: { email: user?.email },
  });

  const doctor = await prisma.doctor.findUniqueOrThrow({
    where: { id: payload?.doctorId },
  });

  const schedule = await prisma.schedule.findFirstOrThrow({
    where: { id: payload?.schduleId },
  });

  const videoCallingId = randomUUID();

  const result = await prisma.$transaction(async (tx) => {
    const createAppointment = await tx.appointment.create({
      data: {
        patientId: patient?.id,
        doctorId: doctor.id,
        scheduleId: schedule.id,
        videoCallingId: videoCallingId,
      },
    });
    if (createAppointment) {
      return await tx.doctorSchedules.update({
        where: {
          doctorId_scheduleId: {
            doctorId: doctor?.id,
            scheduleId: schedule?.id,
          },
        },
        data: { isBooked: true },
      });
    }
  });

  return result;
};
const changeAppointmentStatus = async (
  id: string,
  user: JwtPayload,
  payload: { status: AppointmentStatus }
) => {
  const appointment = await prisma.appointment.findUniqueOrThrow({
    where: { id: id },
    include: { patient: true, doctor: true },
  });

  let result;
  if (user?.role === Role.PATIENT) {
    const checkEmail = appointment?.patient?.email === user?.email;
    if (!checkEmail) {
      throw new AppError(
        status.BAD_REQUEST,
        "Unauthorized Access. You are unauthorized patient"
      );
    }
    if (
      appointment?.status !== AppointmentStatus.SCHEDULED ||
      payload?.status !== AppointmentStatus.CANCELED
    ) {
      throw new AppError(
        status.INTERNAL_SERVER_ERROR,
        `${payload?.status} is not accepted for patient`
      );
    }
    result = await prisma.appointment.update({
      where: { id: id },
      data: { status: payload?.status },
    });
  }

  if (user?.role === Role.DOCTOR) {

    const checkEmail = appointment?.doctor?.email === user?.email;
    if (!checkEmail) {
      throw new AppError(
        status.BAD_REQUEST,
        "Unauthorized Access. You are unauthorized doctor"
      );
    }
  
   if ((appointment.status === AppointmentStatus.COMPLETED) || (appointment.status === AppointmentStatus.CANCELED)
    ) 
{
      throw new AppError(
        status.BAD_REQUEST,
        `Appointment already ${appointment.status}. You cannot change it`
      );
    }
  
    if (appointment.status === AppointmentStatus.SCHEDULED) {
        const supportedStatus:AppointmentStatus[]=[
            AppointmentStatus.CANCELED,AppointmentStatus.INPROGRESS
        ]
    if ( !(supportedStatus).includes(payload?.status) )

       {
        throw new AppError(
          status.BAD_REQUEST,
          `From SCHEDULED you can only go to INPROGRESS or CANCELED`
        );
      }
    } 

     if (appointment.status === AppointmentStatus.INPROGRESS) {
      if (payload.status !== AppointmentStatus.COMPLETED) {
        throw new AppError(
          status.BAD_REQUEST,
          `From INPROGRESS you can only go to COMPLETED`
        );
      }
    }
 
    result = await prisma.appointment.update({
      where: { id },
      data: { status: payload.status },
    });
  


}







  if (
    user?.role === Role.ADMIN ||
    user?.role === Role.SUPER_ADMIN
  ){
    result = await prisma.appointment.update({
        where: { id: id },
        data: { status: payload?.status },
      });
  }
  return result;
};

export const appointmentService = {
  bookAppointment,
  changeAppointmentStatus,
};
