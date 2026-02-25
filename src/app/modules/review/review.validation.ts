import { z } from "zod";

export const createReviewSchema = z.object({
  rating: z
    .number("Rating is required")
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot be more than 5"),

  comment: z
    .string("Comment must be a string")
    .max(1000, "Comment cannot exceed 1000 characters")
    .optional(),

  appointmentId: z
    .string("Appointment ID is required")
    .min(1, "Appointment ID cannot be empty"),
  doctorId: z
    .string("Doctor ID is required")
    .min(1, "Doctor ID cannot be empty"),
});

export const reviewSchema = { createReviewSchema };
