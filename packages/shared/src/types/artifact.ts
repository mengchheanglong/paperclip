export type ArtifactStatus = "approved";
export type ArtifactFormat = "markdown";
export type ArtifactStorageType = "file";
export type ArtifactCreatedByType = "agent" | "user" | "system";

export interface Artifact {
  id: string;
  companyId: string;
  sourceType: string;
  sourceId: string;
  status: ArtifactStatus;
  version: number;
  title: string | null;
  format: ArtifactFormat;
  storageType: ArtifactStorageType;
  storagePath: string;
  contentHash: string;
  createdByType: ArtifactCreatedByType;
  createdById: string;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ArtifactCreatedEvent {
  artifactId: string;
  companyId: string;
  sourceType: string;
  sourceId: string;
  status: ArtifactStatus;
  version: number;
  format: ArtifactFormat;
  storageType: ArtifactStorageType;
  storagePath: string;
  contentHash: string;
  metadata: Record<string, unknown> | null;
}
