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
  while (currentDate <= lastDate) {
    const startDateTime = new Date(
      addMinutes(
        addHours(
          `${format(new Date(currentDate), "yyyy-MM-dd")}`,
          Number(startTime.split(":")[0])
        ),
        Number(startTime.split(":")[1])
      )
    );
    const endDateTime = new Date(
        addMinutes(
          addHours(
            `${format(new Date(currentDate), "yyyy-MM-dd")}`,
            Number(endTime.split(":")[0])
          ),
          Number(endTime.split(":")[1])
        )
      );
    while(startDateTime<= endDateTime){
     const startTime1=await convertDateTime(new Date(startDateTime));
     const endTime1=await convertDateTime(new Date(addMinutes(new Date(startDateTime),interval)));
     
    const existSchedule=await prisma.schedule.findFirst({
        where:{
            startDateTime:startTime1,
            endDateTime:endTime1
        }
    })

    if(!existSchedule){
        const result=await prisma.schedule.create({
            data:{
                startDateTime:startDateTime,
                endDateTime:endDateTime
            }
        });
        schedules.push(result);
    }
     

        startDateTime.setMinutes(startDateTime.getMinutes()+interval)
    }
      
      currentDate.setDate(currentDate.getDate()+1);
  }
};

export const scheduleService = { createSchedule };
