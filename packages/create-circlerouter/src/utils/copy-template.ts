import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

interface CopyTemplateOptions {
  templateDir: string;
  targetDir: string;
  /** Substituições de texto aplicadas em todo arquivo copiado (ex: __PROJECT_NAME__). */
  replacements: Record<string, string>;
}

export async function copyTemplate({
  templateDir,
  targetDir,
  replacements,
}: CopyTemplateOptions): Promise<void> {
  await mkdir(targetDir, { recursive: true });
  const entries = await readdir(templateDir, { withFileTypes: true });

  for (const entry of entries) {
    const from = join(templateDir, entry.name);
    // "gitignore" no template vira ".gitignore" no projeto gerado — evita que o
    // .gitignore do template seja interpretado pelo git deste próprio monorepo.
    const targetName = entry.name === "gitignore" ? ".gitignore" : entry.name;
    const to = join(targetDir, targetName);

    if (entry.isDirectory()) {
      await copyTemplate({ templateDir: from, targetDir: to, replacements });
      continue;
    }

    const content = await readFile(from, "utf8");
    const replaced = Object.entries(replacements).reduce(
      (acc, [search, value]) => acc.replaceAll(search, value),
      content
    );
    await writeFile(to, replaced);
  }
}
