// fallow-ignore-file coverage-gaps
import { createServerFn } from "@tanstack/react-start";
import Stripe from "stripe";
import { z } from "zod";

const checkoutInput = z.object({
  priceId: z.string().min(1),
});

/** Creates a Stripe checkout session for a configured price. */
export const createCheckoutSession = createServerFn({ method: "POST" })
  .inputValidator((input) => checkoutInput.parse(input))
  .handler(async ({ data }) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");
    const appUrl = process.env.PUBLIC_APP_URL ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      cancel_url: `${appUrl}/`,
      line_items: [{ price: data.priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${appUrl}/?checkout=success`,
    });

    return {
      id: session.id,
      url: session.url,
    };
  });
