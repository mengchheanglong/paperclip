import path from "node:path";
import type { ArtifactCreatedEvent } from "@paperclipai/shared";
import type { TranscendiverseVaultSyncConfig } from "./config.js";

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "artifact";
}

function resolveApprovedYear(metadata: Record<string, unknown> | null) {
  const approvedAtRaw = typeof metadata?.approvedAt === "string" ? metadata.approvedAt : null;
  const approvedAt = approvedAtRaw ? new Date(approvedAtRaw) : new Date();
  return Number.isNaN(approvedAt.getTime()) ? String(new Date().getUTCFullYear()) : String(approvedAt.getUTCFullYear());
}

function buildArtifactSlug(event: ArtifactCreatedEvent) {
  const metadata = event.metadata ?? {};
  const issueIdentifier = typeof metadata.issueIdentifier === "string" ? metadata.issueIdentifier : null;
  const documentKey = typeof metadata.documentKey === "string" ? metadata.documentKey : null;
  const base = issueIdentifier
    ? `${issueIdentifier}${documentKey ? `-${documentKey}` : ""}`
    : `${event.sourceType}-${event.sourceId}`;
  return `${slugify(base)}-approved-v${String(event.version).padStart(3, "0")}`;
}

function toVaultWikiLink(relativePath: string) {
  return relativePath.replace(/\\/g, "/").replace(/\.md$/i, "");
}

export function mapArtifactToVault(
  config: TranscendiverseVaultSyncConfig,
  event: ArtifactCreatedEvent,
) {
  if (!config.vaultRoot) {
    throw new Error("Transcendiverse vault root is not configured");
  }

  const slug = buildArtifactSlug(event);
  const year = resolveApprovedYear(event.metadata);
  const rawRelativePath = path.join(config.rawImportDir, year, `${slug}.md`);
  const distillationRelativePath = path.join(config.distillationDir, `${slug}-synthesis.md`);

  return {
    slug,
    rawAbsolutePath: path.resolve(config.vaultRoot, rawRelativePath),
    distillationAbsolutePath: path.resolve(config.vaultRoot, distillationRelativePath),
    rawRelativePath,
    distillationRelativePath,
    rawWikiLink: toVaultWikiLink(rawRelativePath),
    distillationWikiLink: toVaultWikiLink(distillationRelativePath),
  };
}
