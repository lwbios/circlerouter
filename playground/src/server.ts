import { createServer } from "@circlerouter/core";

await createServer({
  port: Number(process.env.PORT) || 3000,
});
