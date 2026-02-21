import { addHours, addMinutes, format } from "date-fns";
import type { ICreateSchedulePayload, IUpdateSchedulePayload } from "./schedule.interface";
import { prisma } from "../../lib/prisma";
import { convertDateTime } from "./schedule.utils";
import type { IQueryParams } from "../../interfaces/query.interface";
import { QueryBuilder } from "../../utils/queryBuilder";
import type { Schedule } from "../../../generated/prisma/client";
import type {
  ScheduleInclude,
  ScheduleWhereInput,
} from "../../../generated/prisma/models";
import { scheduleFilterableFields, scheduleSearchableFields } from "./schedule.constant";
import { AppError } from "../../errorHelplers/appError";
import status from "http-status";

const createSchedule = async (payload: ICreateSchedulePayload) => {
  const { startDate, endDate, startTime, endTime } = await payload;


  const today = new Date().toISOString().split("T")[0];

  if ((startDate < (today as any)) || (endDate < (today as any))) {
    throw new Error("Previous Date is not accepted");
  }


  const currentDate = new Date(startDate);
  const lastDate = new Date(endDate);
  const interval = 30;
  const schedules = [];
  let result;
  while (currentDate <= lastDate) {
    const startDateTimeFormat = new Date(
      addMinutes(
        addHours(
          `${format(new Date(currentDate), "yyyy-MM-dd")}`,
          Number(startTime.split(":")[0])
        ),
        Number(startTime.split(":")[1])
      )
    );
    const endDateTimeFormat = new Date(
      addMinutes(
        addHours(
          `${format(new Date(currentDate), "yyyy-MM-dd")}`,
          Number(endTime.split(":")[0])
        ),
        Number(endTime.split(":")[1])
      )
    );
    while (startDateTimeFormat < endDateTimeFormat) {
      const startTime1 = await convertDateTime(new Date(startDateTimeFormat));
      const endTime1 = await convertDateTime(
        addMinutes(new Date(startDateTimeFormat), interval)
      );

      const existSchedule = await prisma.schedule.findFirst({
        where: {
          startDateTime: startTime1,
          endDateTime: endTime1,
        },
      });

      if (existSchedule) {
         throw new AppError(status.BAD_REQUEST,'Already created the schedule');
      }
      result = await prisma.schedule.create({
        data: {
          startDateTime: startTime1,
          endDateTime: endTime1,
        },
      });
      schedules.push(result);
      startDateTimeFormat.setMinutes(
        startDateTimeFormat.getMinutes() + interval
      );
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  if (schedules.length > 0 ) {
    return { result, schedules };
  }
};

const getSchedule = async (query:IQueryParams) => {
  const queries = new QueryBuilder<
    Schedule,
    ScheduleWhereInput,
    ScheduleInclude
  >(prisma.schedule, query as IQueryParams,{searchableFields:scheduleSearchableFields,filterableFields:scheduleFilterableFields});
  const result=await queries.search().filter().paginate().include({appointments:true,doctorSchedules:true}).execute();

return result;


};
const getScheduleById = async (id: string) => {
  const schedule = await prisma.schedule.findUnique({
      where: {
          id: id
      }
  });
  return schedule;
}

const updateSchedule = async (id: string, payload: IUpdateSchedulePayload) => {
 
  const { startDate, endDate, startTime, endTime } = payload;
  const today = new Date().toISOString().split("T")[0];

  if ((startDate < (today as any)) || (endDate < (today as any))) {
    throw new Error("Previous Date is not accepted");
  }

  const startDateTime = new Date(
      addMinutes(
          addHours(
              `${format(new Date(startDate), 'yyyy-MM-dd')}`,
              Number(startTime.split(':')[0])
          ),
          Number(startTime.split(':')[1])
      )
  );

  const endDateTime = new Date(
      addMinutes(
          addHours(
              `${format(new Date(endDate), 'yyyy-MM-dd')}`,
              Number(endTime.split(':')[0])
          ),
          Number(endTime.split(':')[1])
      )
  );

  const updatedSchedule = await prisma.schedule.update({
      where: {
          id: id
      },
      data: {
          startDateTime: startDateTime,
          endDateTime: endDateTime
      }
  });

  return updatedSchedule;
}
const deleteSchedule = async (id: string) => {
await prisma.schedule.delete({
  where: {
      id: id
  }
});
return true;
}


export const scheduleService = { createSchedule,getScheduleById, getSchedule,updateSchedule,deleteSchedule };
