export type PackageManager = "npm" | "yarn" | "pnpm" | "bun";

export function detectPackageManager(): PackageManager {
  const userAgent = process.env.npm_config_user_agent;
  if (!userAgent) return "npm";

  if (userAgent.startsWith("bun")) return "bun";
  if (userAgent.startsWith("pnpm")) return "pnpm";
  if (userAgent.startsWith("yarn")) return "yarn";
  return "npm";
}

export function installArgs(pm: PackageManager): [string, string[]] {
  switch (pm) {
    case "bun":
      return ["bun", ["install"]];
    case "pnpm":
      return ["pnpm", ["install"]];
    case "yarn":
      return ["yarn", []];
    case "npm":
      return ["npm", ["install"]];
  }
}

export function installLabel(pm: PackageManager): string {
  const [command, args] = installArgs(pm);
  return [command, ...args].join(" ");
}

export function devCommand(pm: PackageManager): string {
  switch (pm) {
    case "npm":
      return "npm run dev";
    case "yarn":
      return "yarn dev";
    case "pnpm":
      return "pnpm dev";
    case "bun":
      return "bun dev";
  }
}
