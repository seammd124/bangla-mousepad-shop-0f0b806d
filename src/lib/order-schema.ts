import { z } from "zod";

// Bangladeshi mobile numbers: 11 digits, 01 + operator digit (3-9) + 8 digits.
export const BD_PHONE_REGEX = /^01[3-9]\d{8}$/;

export const orderSchema = z.object({
  email: z
    .string()
    .trim()
    .max(255, "Email is too long")
    .email("Enter a valid email address | সঠিক ইমেইল দিন")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .trim()
    .regex(BD_PHONE_REGEX, "Enter a valid 11-digit Bangladeshi number, e.g. 01881655083"),
  customerName: z.string().trim().min(2, "Name is required | নাম দিন").max(120),
  address: z.string().trim().min(5, "Full address is required | ঠিকানা দিন").max(400),
  city: z.string().trim().min(2, "City is required | শহর দিন").max(80),
  area: z.string().trim().min(2, "Area is required | এলাকা দিন").max(120),
  postalCode: z.string().trim().regex(/^\d{4}$/, "Postal code must be 4 digits | ৪ সংখ্যার পোস্ট কোড"),
  designId: z.string().trim().min(1, "Choose a design | ডিজাইন বাছুন"),
  thickness: z.enum(["4mm", "5mm"]),
  quantity: z.number().int().min(1).max(5),
  deliveryArea: z.enum(["dhaka", "outside"]),
  note: z.string().trim().max(500).optional().or(z.literal("")),
});

export type OrderInput = z.infer<typeof orderSchema>;
