import { spawn } from "node:child_process";

function quoteForWindowsShell(arg: string): string {
  if (arg.length > 0 && !/[\s"]/.test(arg)) return arg;
  return `"${arg.replace(/"/g, '\\"')}"`;
}

export function runCommand(
  command: string,
  args: string[],
  cwd: string
): Promise<void> {
  return new Promise((resolvePromise, reject) => {
    // npm/yarn/pnpm/bun/git são shims .cmd no Windows — sem shell, spawn falha com
    // ENOENT. Com shell habilitado, o Node só concatena `args` sem escapar (avisa
    // com DEP0190), então montamos a string já quotada nós mesmos.
    const isWindows = process.platform === "win32";
    const child = isWindows
      ? spawn([command, ...args.map(quoteForWindowsShell)].join(" "), {
          cwd,
          stdio: "ignore",
          shell: true,
        })
      : spawn(command, args, { cwd, stdio: "ignore" });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolvePromise();
      } else {
        reject(
          new Error(`"${command} ${args.join(" ")}" saiu com código ${code}`)
        );
      }
    });
  });
}
