import z from "zod";

const bookAppointmentSchema=z.object({
    doctorId:z.string('doctorId is required'),
    scheduleId:z.string('scheduleId is required')
})
const paymentInitiateSchema = z.object({
  appointmentId: z
    .string(
       "Appointment ID is required",
    ).min(1, "Appointment ID cannot be empty"),

  doctorId: z.string ("doctor ID is required").min(1, "doctor ID cannot be empty")

});
export const appointmentSchema={bookAppointmentSchema,paymentInitiateSchema}