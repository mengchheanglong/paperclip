import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { ensurePostgresDatabase, getPostgresDataDirectory } from "./client.js";

export function readRunningPostmasterPid(postmasterPidFile: string): number | null {
  if (!existsSync(postmasterPidFile)) return null;
  try {
    const pid = Number(readFileSync(postmasterPidFile, "utf8").split("\n")[0]?.trim());
    if (!Number.isInteger(pid) || pid <= 0) return null;
    process.kill(pid, 0);
    return pid;
  } catch {
    return null;
  }
}

export function readPostmasterPidPort(postmasterPidFile: string): number | null {
  if (!existsSync(postmasterPidFile)) return null;
  try {
    const lines = readFileSync(postmasterPidFile, "utf8").split("\n");
    const port = Number(lines[3]?.trim());
    return Number.isInteger(port) && port > 0 ? port : null;
  } catch {
    return null;
  }
}

export function readPostmasterOptsPort(postmasterOptsFile: string): number | null {
  if (!existsSync(postmasterOptsFile)) return null;
  try {
    const content = readFileSync(postmasterOptsFile, "utf8");
    const match =
      content.match(/(?:^|\s)"?-p"?\s+"?(\d+)"?(?:\s|$)/) ??
      content.match(/(?:^|\s)"?--port"?\s+"?(\d+)"?(?:\s|$)/);
    const port = Number(match?.[1]);
    return Number.isInteger(port) && port > 0 ? port : null;
  } catch {
    return null;
  }
}

export async function tryAdoptEmbeddedPostgresCluster(input: {
  dataDir: string;
  ports: Array<number | null | undefined>;
  databaseName?: string;
}): Promise<number | null> {
  const normalizedDataDir = path.resolve(input.dataDir);
  const databaseName = input.databaseName ?? "paperclip";
  const candidatePorts = [...new Set(
    input.ports.filter((port): port is number => typeof port === "number" && Number.isInteger(port) && port > 0),
  )];

  for (const port of candidatePorts) {
    const adminConnectionString = `postgres://paperclip:paperclip@127.0.0.1:${port}/postgres`;
    try {
      const actualDataDir = await getPostgresDataDirectory(adminConnectionString);
      const matchesDataDir =
        typeof actualDataDir === "string" &&
        path.resolve(actualDataDir) === normalizedDataDir;
      if (!matchesDataDir) {
        continue;
      }
      await ensurePostgresDatabase(adminConnectionString, databaseName);
      return port;
    } catch {
      // Try the next candidate port.
    }
  }

  return null;
}
