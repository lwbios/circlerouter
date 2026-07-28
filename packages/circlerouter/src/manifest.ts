import { mkdir, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";
import pc from "picocolors";
import { HTTP_METHODS, loadRouteModule } from "./adapter";
import type { DiscoveredRoute } from "./types";

export async function writeManifest(
  routes: DiscoveredRoute[],
  cwd: string
): Promise<void> {
  const dir = join(cwd, ".circlerouter");
  await mkdir(dir, { recursive: true });

  const manifest = {
    generatedAt: new Date().toISOString(),
    routes: routes.map((route) => ({
      path: route.elysiaPath,
      source: route.sourcePath,
      file: relative(cwd, route.filePath),
    })),
  };

  await writeFile(
    join(dir, "manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`
  );
}

export async function printRouteTable(routes: DiscoveredRoute[]): Promise<void> {
  const lines: string[] = [];

  for (const route of routes) {
    const routeModule = await loadRouteModule(route.filePath);
    for (const method of HTTP_METHODS) {
      if (!routeModule[method]) continue;
      lines.push(
        `  ${pc.dim("○")} ${pc.cyan(method.padEnd(6))} ${route.elysiaPath}`
      );
    }
  }

  if (lines.length === 0) {
    console.log(pc.yellow("  Nenhuma rota encontrada em src/app."));
    return;
  }

  console.log(pc.bold("\n  Rotas:"));
  for (const line of lines) console.log(line);
  console.log();
}
