import z from "zod";
import { Gender } from "../../../generated/prisma/enums";

const CreateDoctorSchema = z.object({
  password: z
    .string("Password is required")
    .min(8, "Minimum lenth will be 8 characters")
    .max(20, "Maximum length can be 20 characters"),
  doctor: z.object({
    name: z.string("name is required"),
    email: z.email("Invalid email address"),

    contactNumber: z
      .string("Contact number is required")
      .min(11, "Contact number must be at least 11 characters")
      .max(14, "Contact number must be at most 15 characters"),

    address: z
      .string("Address is required")
      .min(10, "Address must be at least 10 characters")
      .max(100, "Address must be at most 100 characters")
      .optional(),

    registrationNumber: z.string("Registration number is required"),
    profilePhoto: z.url(),
    experience: z
      .int()
      .nonnegative("Experience years not can be negativ")
      .optional(),
    gender: z.enum([Gender.FEMALE, Gender.MALE, Gender.OTHER]),
    appointmentFee: z.number("Appointment Fee is required").nonnegative('Appointment Fee not can be negative'),
    qualification: z.string("qualification is required"),
    currentWorkingPlace: z.string("currentWorkingPlace is required"),
    designation: z.string("designation is required"),
    avaerageRating:  z.number("AverageRating must be a number").nonnegative("avaerageRating cannot be negative").optional()
  }),
  specialities:z.array(z.uuid(),'').min(1,'minimum one specialities is required')
});

export const userValidationSchema = { CreateDoctorSchema };
