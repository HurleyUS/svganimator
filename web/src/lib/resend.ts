/**
 * Web Src Lib Resend public module surface.
 */
// fallow-ignore-file coverage-gaps
import { createServerFn } from "@tanstack/react-start";
import { Resend } from "resend";
import { z } from "zod";

const contactInput = z.object({
  email: z.string().email(),
  message: z.string().min(1),
});

/** Sends a starter contact email through Resend. */
export const sendContactEmail = createServerFn({ method: "POST" })
  .inputValidator((input) => contactInput.parse(input))
  .handler(async ({ data }) => {
    const resend = new Resend(process.env.RESEND_API_KEY);

    return resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? "hello@example.com",
      subject: "Canaveral contact",
      text: data.message,
      to: data.email,
    });
  });
