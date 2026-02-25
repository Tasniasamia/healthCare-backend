import { z } from "zod";

export const createPrescriptionSchema = z.object({
  followUpDate: z
    .string("Follow-up date is required" )
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Follow-up date must be a valid date string (YYYY-MM-DD)",
    }),
  
  instructions: z
    .string("Instructions are required" )
    .min(1, "Instructions cannot be empty"),

  appointmentId: z.string( "Appointment ID is required").min(1),
  patientId: z.string("Patient ID is required" ).min(1),
});

export const prescriptionSchema={createPrescriptionSchema}