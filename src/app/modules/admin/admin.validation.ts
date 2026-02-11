import { z } from "zod";

 const updateAdminSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .optional(),

  email: z
    .string()
    .email("Invalid email address")
    .optional(),

  profilePhoto: z
    .string()
    .url("Profile photo must be a valid URL")
    .optional(),

  contactNumber: z
    .string()
    .min(10, "Contact number must be at least 10 digits")
    .max(15, "Contact number must be at most 15 digits")
    .optional(),

  userId: z.string('UserId is required'),
});

export const adminSchema={updateAdminSchema}
