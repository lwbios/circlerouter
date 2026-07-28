import { existsSync, readdirSync, statSync } from "node:fs";

// Arquivos/pastas comuns que não devem impedir o scaffold — ex: repo já criado
// no GitHub e clonado vazio, ou pasta com só um .gitignore/README manual.
const SAFE_TO_IGNORE = new Set([
  ".git",
  ".gitignore",
  ".gitattributes",
  ".hg",
  ".idea",
  ".vscode",
  ".DS_Store",
  "Thumbs.db",
  "LICENSE",
  "LICENSE.md",
  "README.md",
]);

/** true se o diretório já existe com arquivos "de verdade" (não dá pra gerar o projeto ali). */
export function isTargetDirBlocked(targetDir: string): boolean {
  if (!existsSync(targetDir)) return false;
  if (!statSync(targetDir).isDirectory()) return true;

  const entries = readdirSync(targetDir).filter(
    (name) => !SAFE_TO_IGNORE.has(name)
  );
  return entries.length > 0;
}
