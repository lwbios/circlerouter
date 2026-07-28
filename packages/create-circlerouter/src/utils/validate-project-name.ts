// Sem barras: usado no prompt interativo, que pede um nome (um único segmento),
// não um caminho.
const INVALID_NAME_CHARS = /[<>:"/\\|?*\x00-\x1F]/;

export function validateProjectName(name: string | undefined): string | undefined {
  const trimmed = (name ?? "").trim();

  if (trimmed.length === 0) return "O nome não pode ser vazio.";
  if (trimmed === "." || trimmed === "..") return undefined;
  if (INVALID_NAME_CHARS.test(trimmed)) {
    return 'O nome não pode conter os caracteres < > : " / \\ | ? *';
  }
  if (trimmed.length > 214) return "O nome é longo demais.";

  return undefined;
}

// Usado para o argumento posicional do CLI, que é um caminho de sistema de
// arquivos (pode ter separadores, e no Windows até letra de unidade "C:\...").
export function validateTargetPath(path: string | undefined): string | undefined {
  const trimmed = (path ?? "").trim();
  if (trimmed.length === 0) return "O caminho não pode ser vazio.";
  return undefined;
}

export function toPackageName(rawName: string): string {
  const kebab = rawName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-~]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return kebab.length > 0 ? kebab : "my-app";
}
