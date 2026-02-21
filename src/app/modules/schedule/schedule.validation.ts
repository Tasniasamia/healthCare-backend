import z from "zod";
const createScheduleSchema=z.object({
    startDate:z.string().refine((date)=>(!isNaN(Date.parse(date))),'Invalid Date format'),
    endDate:z.string().refine((date)=>(!isNaN(Date.parse(date))),'Invalid Date format'),
    startTime:z.string().refine((time) => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time),'Invalid time format'),
    endTime:z.string().refine((time) => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time),'Invalid time format'),

})

export const scheduleSchema={createScheduleSchema}