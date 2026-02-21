import status from "http-status";
import { AppError } from "../../errorHelplers/appError";
import { prisma } from "../../lib/prisma";
import type {
  ICreatedoctorSchedulePayload,
  IUpdatedoctorSchedulePayload,
} from "./doctorSchedule.interface";
import type { JwtPayload } from "jsonwebtoken";

const createDoctorSchedule = async (
  user: JwtPayload,
  payload: ICreatedoctorSchedulePayload
) => {
  const { scheduleId } = await payload;

  const isDoctorExist = await prisma.doctor.findFirst({
    where: { email: user?.email },
  });
  if (!isDoctorExist) {
    throw new AppError(status.UNAUTHORIZED, "Doctor doesn't exist here");
  }
  const existingSchedules = await prisma.schedule.findMany({
    where: {
      id: { in: scheduleId },
      
    },
  });

  if (existingSchedules.length !== scheduleId.length) {
    throw new Error("One or more schedule IDs not found");
  }
  const doctorSchedules = scheduleId?.map((i: string) => {
    return {
      doctorId: isDoctorExist?.id as string,
      scheduleId: i,
    };
  });
  const result = await prisma.doctorSchedules.createMany({
    data: doctorSchedules,
  });
  return result;
};

const updateDoctorSchedule = async (
    user: JwtPayload,
    payload: IUpdatedoctorSchedulePayload
  ) => {
    const { scheduleId } = payload;
  
    const isDoctorExist = await prisma.doctor.findFirst({
      where: { email: user?.email },
    });
  
    if (!isDoctorExist) {
      throw new AppError(status.UNAUTHORIZED, "Doctor doesn't exist here");
    }
  
    const filterdeletedoctorScheduleList = scheduleId?.filter(
      (i: { id: string; shouldDelete: boolean }) => i?.shouldDelete
    );
  
    const filterUpdatedoctorScheduleList = scheduleId?.filter(
      (i: { id: string; shouldDelete: boolean }) => !i?.shouldDelete
    );

    for (let idx of filterdeletedoctorScheduleList) {
      const existingSchedule = await prisma.doctorSchedules.findFirst({
        where: {
          isBooked:false,
          scheduleId: idx?.id,
          doctorId: isDoctorExist.id,
        },
      });
  
      if (existingSchedule) {
        await prisma.doctorSchedules.delete({
          where: {
            doctorId_scheduleId: {
              doctorId: isDoctorExist.id,
              scheduleId: idx?.id,
            },
          },
        });
      } else {
        throw new AppError(status.BAD_REQUEST,`Schedule ${idx?.id} not found, skipping delete`); 
      }
    }
  

    let result;
    for (let idx of filterUpdatedoctorScheduleList) {
      result = await prisma.doctorSchedules.upsert({
        where: {
          doctorId_scheduleId: {
            doctorId: isDoctorExist.id,
            scheduleId: idx.id,
          },
        },
        update: {
            
        },
        create: {
          doctorId: isDoctorExist.id,
          scheduleId: idx?.id,
        },
      });
    }
  
    return result;
  }; 

export const doctorScheduleService = { createDoctorSchedule ,updateDoctorSchedule};
