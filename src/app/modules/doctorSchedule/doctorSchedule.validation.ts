import z from "zod";

const createDoctorScheduleSchema=z.object({
    scheduleId:z.array(z.string())

})
const updateDoctorScheduleSchema=z.object({
    scheduleId:z.array(z.object({
        id:z.string(),
        shouldDelete:z.boolean()
    }))

})
export const doctorscheduleSchema={createDoctorScheduleSchema,updateDoctorScheduleSchema}