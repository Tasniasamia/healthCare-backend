import { addHours, addMinutes, format } from "date-fns";
import type { ICreateSchedulePayload } from "./schedule.interface";
import { prisma } from "../../lib/prisma";
import { convertDateTime } from "./schedule.utils";

const createSchedule = async (payload: ICreateSchedulePayload) => {
  const { startDate, endDate, startTime, endTime } = await payload;
  const currentDate = new Date(startDate);
  const lastDate = new Date(endDate);
  const interval = 30;
  const schedules=[];
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
    while(startDateTimeFormat< endDateTimeFormat){
     const startTime1=await convertDateTime(new Date(startDateTimeFormat));
     const endTime1=await convertDateTime(addMinutes(new Date(startDateTimeFormat),interval));
     
    const existSchedule=await prisma.schedule.findFirst({
        where:{
            startDateTime:startTime1,
            endDateTime:endTime1
        }
    })

    if(!existSchedule){
         result=await prisma.schedule.create({
            data:{
                startDateTime:startTime1,
                endDateTime:endTime1
            }
        });
        schedules.push(result);
    }
     

        startDateTimeFormat.setMinutes(startDateTimeFormat.getMinutes()+interval)
    }
      
      currentDate.setDate(currentDate.getDate()+1);
  }


  if(schedules.length>0){
    return {result,schedules}
  }
};

export const scheduleService = { createSchedule };
