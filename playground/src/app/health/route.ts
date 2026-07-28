import { CircleResponse } from "@circlerouter/core";

// GET /health
export function GET() {
  return CircleResponse.json({ status: "ok", uptime: process.uptime() });
}
