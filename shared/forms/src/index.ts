// fallow-ignore-file coverage-gaps
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

/** Validates the reusable contact form fields. */
export const contactFormSchema = z.object({
  email: z.string().email(),
  message: z.string().min(10).max(1000),
  name: z.string().min(1).max(120),
});

/** Contact form value shape inferred from the Zod schema. */
export type ContactFormValues = z.infer<typeof contactFormSchema>;

/** React Hook Form resolver for the contact form schema. */
export const contactFormResolver = zodResolver(contactFormSchema);

/** Validates the starter waitlist form fields. */
export const waitlistFormSchema = z.object({
  email: z.string().email(),
});

/** React Hook Form resolver for the waitlist form schema. */
export const waitlistFormResolver = zodResolver(waitlistFormSchema);
