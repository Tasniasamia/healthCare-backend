import z from "zod";

const createUpdateDoctorSchema=z.object({
   userId:z.string().optional(),
    name: z.string().optional(),
    profilePhoto: z.url("Invalid URL format").optional(),
    contactNumber: z.string().optional(),
    registrationNumber: z.string().optional(),
    experience: z
      .int("Experience must be a whole number")
      .min(0, "Experience cannot be negative")
      .optional(),
    gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
    appointmentFee: z
      .number()
      .positive("Appointment fee must be positive")
      .optional(),
    qualification: z.string().optional(),
    currentWorkingPlace: z.string().optional(),
    designation: z.string().optional(),
    specialities: z
      .array(z.object({  specilitiesId:z.string(),
        shouldDelete:z.boolean().optional()}))
      .optional(),
  })

  export const doctorSchema={createUpdateDoctorSchema}