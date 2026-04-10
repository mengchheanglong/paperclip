import path from "node:path";
import { z } from "zod";
import { loadConfig } from "../../config.js";

const transcendiverseVaultSyncConfigSchema = z.object({
  enabled: z.boolean().default(false),
  vaultRoot: z.string().trim().min(1).nullable().optional(),
  rawImportDir: z.string().trim().min(1).default("wiki/sources/internal/paperclip"),
  distillationDir: z.string().trim().min(1).default("wiki/syntheses/paperclip"),
  autoWriteRaw: z.boolean().default(true),
  autoWriteDistillation: z.boolean().default(true),
  autoMergeCanonical: z.boolean().default(false),
});

export type TranscendiverseVaultSyncConfig = z.infer<typeof transcendiverseVaultSyncConfigSchema> & {
  vaultRoot: string | null;
};

function parseBooleanEnv(name: string, fallback: boolean) {
  const raw = process.env[name];
  if (raw === undefined) return fallback;
  return raw === "true";
}

function parseStringEnv(name: string, fallback: string | null) {
  const raw = process.env[name]?.trim();
  return raw && raw.length > 0 ? raw : fallback;
}

export function loadTranscendiverseVaultSyncConfig(): TranscendiverseVaultSyncConfig {
  const config = loadConfig();
  const rawExtensionConfig = config.extensions.transcendiverseVaultSync;
  const extensionConfig =
    rawExtensionConfig && typeof rawExtensionConfig === "object" && !Array.isArray(rawExtensionConfig)
      ? rawExtensionConfig
      : {};
  const extensionConfigObject = extensionConfig as {
    enabled?: boolean;
    vaultRoot?: string | null;
    rawImportDir?: string;
    distillationDir?: string;
    autoWriteRaw?: boolean;
    autoWriteDistillation?: boolean;
    autoMergeCanonical?: boolean;
  };
  const extensionVaultRoot =
    typeof extensionConfigObject.vaultRoot === "string"
      ? extensionConfigObject.vaultRoot
      : null;
  const extensionRawImportDir =
    typeof extensionConfigObject.rawImportDir === "string"
      ? extensionConfigObject.rawImportDir
      : "wiki/sources/internal/paperclip";
  const extensionDistillationDir =
    typeof extensionConfigObject.distillationDir === "string"
      ? extensionConfigObject.distillationDir
      : "wiki/syntheses/paperclip";

  const parsed = transcendiverseVaultSyncConfigSchema.parse({
    ...extensionConfig,
    enabled: parseBooleanEnv(
      "PAPERCLIP_TRANSCENDIVERSE_VAULT_SYNC_ENABLED",
      Boolean(extensionConfigObject.enabled ?? false),
    ),
    vaultRoot: parseStringEnv(
      "PAPERCLIP_TRANSCENDIVERSE_VAULT_ROOT",
      extensionVaultRoot,
    ),
    rawImportDir: parseStringEnv(
      "PAPERCLIP_TRANSCENDIVERSE_RAW_IMPORT_DIR",
      extensionRawImportDir,
    ),
    distillationDir: parseStringEnv(
      "PAPERCLIP_TRANSCENDIVERSE_DISTILLATION_DIR",
      extensionDistillationDir,
    ),
    autoWriteRaw: parseBooleanEnv(
      "PAPERCLIP_TRANSCENDIVERSE_AUTO_WRITE_RAW",
      Boolean(extensionConfigObject.autoWriteRaw ?? true),
    ),
    autoWriteDistillation: parseBooleanEnv(
      "PAPERCLIP_TRANSCENDIVERSE_AUTO_WRITE_DISTILLATION",
      Boolean(extensionConfigObject.autoWriteDistillation ?? true),
    ),
    autoMergeCanonical: parseBooleanEnv(
      "PAPERCLIP_TRANSCENDIVERSE_AUTO_MERGE_CANONICAL",
      Boolean(extensionConfigObject.autoMergeCanonical ?? false),
    ),
  });

  return {
    ...parsed,
    vaultRoot: parsed.vaultRoot ? path.resolve(parsed.vaultRoot) : null,
  };
}
