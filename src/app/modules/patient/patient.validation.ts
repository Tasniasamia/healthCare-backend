import { z } from "zod";
import { Gender, BloodGroup } from "../../../generated/prisma/enums";

// ==================
// User Profile Schema
// ==================
export const userProfileSchema = z.object({
  name: z.string().min(1).optional(),
  image: z.string().url().optional(),
});

// ==================
// Patient Profile Schema
// ==================
export const patientProfileSchema = z.object({
  name: z.string().min(1).optional(),
  profilePhoto: z.string().url().optional(),
  contactNumber: z.string().min(6).optional(),
  address: z.string().min(3).optional(),
});

// ==================
// Patient Health Schema
// ==================
export const patientHealthSchema = z.object({
  gender: z.nativeEnum(Gender, "Gender is required"
  ),

  dateOfBirth: z.string().refine(
    (date) => !isNaN(Date.parse(date)),
    "Invalid date format"
  ),

  bloodGroup: z.nativeEnum(BloodGroup, "Blood group is required"),

  hasAllergies: z.boolean().optional(),
  hasDiabetes: z.boolean().optional(),

  height: z.string().min(1, "Height is required"),
  weight: z.string().min(1, "Weight is required"),

  smokingStatus: z.boolean().optional(),
  dietaryPreferences: z.string().optional(),
  pregnancyStatus: z.boolean().optional(),
  mentalHealthHistory: z.string().optional(),
  immunizationStatus: z.string().optional(),
  hasPastSurgeries: z.boolean().optional(),
  recentAnxiety: z.boolean().optional(),
  recentDepression: z.boolean().optional(),
  maritalStatus: z.string().optional(),

  patientId: z.string().optional(),
});

// ==================
// Medical Report Schema
// ==================
export const reportSchema = z.object({
  reportName: z.string().optional(),
  reportLink: z.string().url().optional(),
  shouldDelete: z.boolean().optional(),
  reportId: z.string().optional(),
});

// ==================
// Main Update Schema
// ==================
export const updatePatientProfileSchema = z.object({
  user: userProfileSchema,
  patientInfo: patientProfileSchema,
  patientHealth: patientHealthSchema,
  medicalReport: z.array(reportSchema).optional(),
});