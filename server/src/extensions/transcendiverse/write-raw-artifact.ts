import fs from "node:fs/promises";
import path from "node:path";

export async function writeRawArtifactToVault(targetPath: string, content: string) {
  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.writeFile(targetPath, content, "utf8");
}
