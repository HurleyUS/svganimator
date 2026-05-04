// fallow-ignore-file coverage-gaps
import { serverEnvSchema } from "../shared/env/src/index";

const result = serverEnvSchema.safeParse(process.env);

if (!result.success) {
  process.stderr.write(`${JSON.stringify(result.error.flatten().fieldErrors, null, 2)}\n`);
  process.exit(1);
}

process.stdout.write("Environment contract is valid.\n");
