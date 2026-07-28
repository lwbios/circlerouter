import { relative, dirname } from "node:path";
import type { DiscoveredRoute, RouteSegment, SegmentKind } from "./types";

const OPTIONAL_CATCH_ALL = /^\[\[\.\.\.(.+)\]\]$/;
const CATCH_ALL = /^\[\.\.\.(.+)\]$/;
const DYNAMIC = /^\[(.+)\]$/;
const ROUTE_GROUP = /^\(.+\)$/;

function toPosix(path: string): string {
  return path.replace(/\\/g, "/");
}

function parseSegment(raw: string): RouteSegment {
  const optionalCatchAll = OPTIONAL_CATCH_ALL.exec(raw);
  if (optionalCatchAll) {
    return { kind: "optionalCatchAll", value: optionalCatchAll[1]! };
  }

  const catchAll = CATCH_ALL.exec(raw);
  if (catchAll) {
    return { kind: "catchAll", value: catchAll[1]! };
  }

  const dynamic = DYNAMIC.exec(raw);
  if (dynamic) {
    return { kind: "dynamic", value: dynamic[1]! };
  }

  return { kind: "static", value: raw };
}

function segmentsFromFile(appDir: string, filePath: string): RouteSegment[] {
  const relativePath = toPosix(relative(appDir, filePath));
  const dir = dirname(relativePath);
  if (dir === ".") return [];

  return dir
    .split("/")
    .filter((raw) => !ROUTE_GROUP.test(raw))
    .map(parseSegment);
}

function assertCatchAllIsLast(segments: RouteSegment[], filePath: string) {
  segments.forEach((segment, index) => {
    const isCatchAll =
      segment.kind === "catchAll" || segment.kind === "optionalCatchAll";
    if (isCatchAll && index !== segments.length - 1) {
      throw new Error(
        `[circlerouter] Segmento catch-all "${toSourceSegment(segment)}" precisa ser o último segmento da rota (${filePath}).`
      );
    }
  });
}

function buildElysiaPath(segments: RouteSegment[], dropLast: boolean): string {
  const effective = dropLast ? segments.slice(0, -1) : segments;
  const parts = effective.map((segment) => {
    switch (segment.kind) {
      case "static":
        return segment.value;
      case "dynamic":
        return `:${segment.value}`;
      case "catchAll":
      case "optionalCatchAll":
        return "*";
    }
  });

  const path = `/${parts.join("/")}`;
  return path.length > 1 ? path.replace(/\/+/g, "/") : path;
}

function toSourceSegment(segment: RouteSegment): string {
  switch (segment.kind) {
    case "static":
      return segment.value;
    case "dynamic":
      return `[${segment.value}]`;
    case "catchAll":
      return `[...${segment.value}]`;
    case "optionalCatchAll":
      return `[[...${segment.value}]]`;
  }
}

function shapeOf(elysiaPath: string): string {
  return elysiaPath
    .split("/")
    .map((part) => (part.startsWith(":") ? ":" : part))
    .join("/");
}

export function discoverRoutes(appDir: string): DiscoveredRoute[] {
  const glob = new Bun.Glob("**/route.ts");
  const files = Array.from(glob.scanSync({ cwd: appDir, absolute: true })).sort();

  const routes: DiscoveredRoute[] = [];
  const shapes = new Map<string, { elysiaPath: string; filePath: string }>();
  const exactPaths = new Map<string, string>();

  const register = (route: DiscoveredRoute) => {
    const existingExact = exactPaths.get(route.elysiaPath);
    if (existingExact && existingExact !== route.filePath) {
      throw new Error(
        `[circlerouter] Rota duplicada "${route.elysiaPath}" definida em "${existingExact}" e "${route.filePath}".`
      );
    }
    exactPaths.set(route.elysiaPath, route.filePath);

    const shape = shapeOf(route.elysiaPath);
    const existingShape = shapes.get(shape);
    if (
      existingShape &&
      existingShape.filePath !== route.filePath &&
      existingShape.elysiaPath !== route.elysiaPath
    ) {
      throw new Error(
        `[circlerouter] Conflito de nome de parâmetro dinâmico: "${existingShape.elysiaPath}" (${existingShape.filePath}) vs "${route.elysiaPath}" (${route.filePath}). Use o mesmo nome de parâmetro no mesmo nível de pasta.`
      );
    }
    shapes.set(shape, { elysiaPath: route.elysiaPath, filePath: route.filePath });

    routes.push(route);
  };

  for (const filePath of files) {
    const segments = segmentsFromFile(appDir, filePath);
    assertCatchAllIsLast(segments, filePath);

    const last = segments[segments.length - 1];
    const sourcePath = `/${segments.map(toSourceSegment).join("/")}`;

    if (last?.kind === "optionalCatchAll") {
      register({
        elysiaPath: buildElysiaPath(segments, true),
        sourcePath,
        filePath,
        catchAllParam: last.value,
      });
      register({
        elysiaPath: buildElysiaPath(segments, false),
        sourcePath,
        filePath,
        catchAllParam: last.value,
      });
      continue;
    }

    register({
      elysiaPath: buildElysiaPath(segments, false),
      sourcePath,
      filePath,
      catchAllParam: last?.kind === "catchAll" ? last.value : undefined,
    });
  }

  return routes;
}

export type { SegmentKind };
