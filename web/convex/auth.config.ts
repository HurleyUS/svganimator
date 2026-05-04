// fallow-ignore-file coverage-gaps
/** Clerk auth provider configuration for Convex. */
export default {
  providers: [
    {
      applicationID: "convex",
      domain: process.env.CLERK_FRONTEND_API_URL,
    },
  ],
};
