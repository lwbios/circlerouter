import { mkdir } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as clack from "@clack/prompts";
import pc from "picocolors";
import { copyTemplate } from "./utils/copy-template";
import {
  detectPackageManager,
  devCommand,
  installArgs,
  installLabel,
  type PackageManager,
} from "./utils/detect-package-manager";
import { runCommand } from "./utils/run-command";
import { isTargetDirBlocked } from "./utils/target-dir";
import {
  toPackageName,
  validateProjectName,
  validateTargetPath,
} from "./utils/validate-project-name";

// Mantido em sincronia com a versão publicada de "@circlerouter/core" a cada release.
const CIRCLEROUTER_VERSION = "^0.1.0";

interface CliFlags {
  projectDirectory?: string;
  install?: boolean;
  git?: boolean;
  packageManager?: PackageManager;
  yes: boolean;
  warnings: string[];
}

function parseCliArgs(argv: string[]): CliFlags {
  const flags: CliFlags = { yes: false, warnings: [] };

  for (const arg of argv) {
    switch (arg) {
      case "--install":
        flags.install = true;
        break;
      case "--no-install":
        flags.install = false;
        break;
      case "--git":
        flags.git = true;
        break;
      case "--no-git":
        flags.git = false;
        break;
      case "--use-npm":
        flags.packageManager = "npm";
        break;
      case "--use-yarn":
        flags.packageManager = "yarn";
        break;
      case "--use-pnpm":
        flags.packageManager = "pnpm";
        break;
      case "--use-bun":
        flags.packageManager = "bun";
        break;
      case "-y":
      case "--yes":
        flags.yes = true;
        break;
      default:
        if (arg.startsWith("-")) {
          flags.warnings.push(`Flag desconhecida ignorada: ${arg}`);
        } else if (!flags.projectDirectory) {
          flags.projectDirectory = arg;
        } else {
          flags.warnings.push(`Argumento extra ignorado: ${arg}`);
        }
    }
  }

  return flags;
}

function exitOnCancel<T>(value: T | symbol): T {
  if (clack.isCancel(value)) {
    clack.cancel("Operação cancelada.");
    process.exit(0);
  }
  return value;
}

async function main() {
  const flags = parseCliArgs(process.argv.slice(2));

  console.log();
  clack.intro(pc.bgMagenta(pc.black(" create-circlerouter ")));
  for (const warning of flags.warnings) clack.log.warn(warning);

  let projectDirectory = flags.projectDirectory;
  if (!projectDirectory) {
    projectDirectory = exitOnCancel(
      await clack.text({
        message: "What is your project named?",
        placeholder: "my-app",
        defaultValue: "my-app",
        validate: validateProjectName,
      })
    );
  } else {
    const error = validateTargetPath(projectDirectory);
    if (error) {
      clack.cancel(error);
      process.exit(1);
    }
  }

  const targetDir = resolve(process.cwd(), projectDirectory);
  const projectName = toPackageName(basename(targetDir));

  if (isTargetDirBlocked(targetDir)) {
    clack.cancel(`A pasta "${projectDirectory}" já existe e não está vazia.`);
    process.exit(1);
  }

  let packageManager: PackageManager =
    flags.packageManager ?? detectPackageManager();
  if (!flags.packageManager && !flags.yes) {
    packageManager = exitOnCancel(
      await clack.select({
        message: "Which package manager do you want to use?",
        options: (["bun", "npm", "pnpm", "yarn"] as const).map((pm) => ({
          value: pm,
          label: pm,
        })),
        initialValue: packageManager,
      })
    );
  }

  let shouldInstall = flags.install;
  if (shouldInstall === undefined) {
    shouldInstall = flags.yes
      ? true
      : exitOnCancel(
          await clack.confirm({
            message: "Instalar dependências agora?",
            initialValue: true,
          })
        );
  }

  let shouldInitGit = flags.git;
  if (shouldInitGit === undefined) {
    shouldInitGit = flags.yes
      ? true
      : exitOnCancel(
          await clack.confirm({
            message: "Inicializar um repositório git?",
            initialValue: true,
          })
        );
  }

  const spinner = clack.spinner();
  spinner.start("Criando os arquivos do projeto");

  // fileURLToPath em vez de import.meta.dirname pra funcionar em qualquer
  // versão de Node (dirname só existe a partir do Node 20.11/21.2).
  const currentDir = dirname(fileURLToPath(import.meta.url));
  const templateDir = join(currentDir, "../template");
  await copyTemplate({
    templateDir,
    targetDir,
    replacements: {
      __PROJECT_NAME__: projectName,
      __CIRCLEROUTER_VERSION__: CIRCLEROUTER_VERSION,
    },
  });
  await mkdir(join(targetDir, ".circlerouter"), { recursive: true });

  spinner.stop("Arquivos do projeto criados.");

  if (shouldInitGit) {
    spinner.start("Inicializando repositório git");
    try {
      await runCommand("git", ["init"], targetDir);
      try {
        await runCommand("git", ["add", "-A"], targetDir);
        await runCommand(
          "git",
          ["commit", "-m", "Initial commit from create-circlerouter"],
          targetDir
        );
        spinner.stop("Repositório git inicializado com o commit inicial.");
      } catch {
        // Comum quando git config user.name/user.email ainda não foi configurado.
        spinner.stop(
          "Repositório git inicializado (sem commit inicial — configure git config user.name/user.email pra commitar)."
        );
      }
    } catch {
      spinner.stop("Não deu pra inicializar o git (pulei essa etapa).");
    }
  }

  if (shouldInstall) {
    spinner.start(`Instalando dependências com ${packageManager}`);
    try {
      const [command, args] = installArgs(packageManager);
      await runCommand(command, args, targetDir);
      spinner.stop("Dependências instaladas.");
    } catch (error) {
      spinner.stop("Falha ao instalar dependências.");
      console.error(pc.red(error instanceof Error ? error.message : String(error)));
    }
  }

  const nextSteps = [
    pc.bold("Pronto! Próximos passos:"),
    "",
    ...(projectDirectory !== "." ? [`  cd ${projectDirectory}`] : []),
    ...(!shouldInstall ? [`  ${installLabel(packageManager)}`] : []),
    `  ${devCommand(packageManager)}`,
    "",
    `Servidor local em ${pc.cyan("http://localhost:3000")}`,
  ];

  clack.outro(nextSteps.join("\n"));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
