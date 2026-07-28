import pc from "picocolors";
import pkg from "../package.json" with { type: "json" };

export function printBanner(port: number, hostname: string | undefined, startedAt: number) {
  const elapsed = Math.max(0, Math.round(performance.now() - startedAt));
  const host = hostname && hostname !== "0.0.0.0" ? hostname : "localhost";

  console.log(
    `\n  ${pc.bold(pc.magenta("○"))} ${pc.bold("circlerouter")} ${pc.dim(`v${pkg.version}`)}`
  );
  console.log(`  ${pc.dim("- Local:")}   http://${host}:${port}`);
  console.log(`  ${pc.dim("- Ready in")} ${elapsed}ms\n`);
}
