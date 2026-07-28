import { CircleResponse } from "@circlerouter/core";

// GET /
export function GET() {
  return CircleResponse.json({ message: "Hello from circlerouter!" });
}
