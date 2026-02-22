import z from "zod";

const bookAppointmentSchema=z.object({
    doctorId:z.string('doctorId is required'),
    scheduleId:z.string('scheduleId is required')
})

export const appointmentSchema={bookAppointmentSchema}