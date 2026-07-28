import { existsSync } from "node:fs";
import { pathToFileURL } from "node:url";
import type { MiddlewareModule } from "./types";

export async function loadMiddleware(
  middlewarePath: string
): Promise<MiddlewareModule | null> {
  if (!existsSync(middlewarePath)) return null;
  const mod = (await import(
    pathToFileURL(middlewarePath).href
  )) as MiddlewareModule;
  return mod;
}

function matchesPattern(pathname: string, pattern: string): boolean {
  if (pattern.endsWith("/:path*") || pattern.endsWith("/*")) {
    const prefix = pattern.replace(/\/(:path\*|\*)$/, "");
    return pathname === prefix || pathname.startsWith(`${prefix}/`);
  }
  return pathname === pattern;
}

export function matchesMiddleware(pathname: string, matcher?: string[]): boolean {
  if (!matcher || matcher.length === 0) return true;
  return matcher.some((pattern) => matchesPattern(pathname, pattern));
}
