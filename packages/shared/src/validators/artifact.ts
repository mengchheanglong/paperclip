import { z } from "zod";

export const artifactStatusSchema = z.enum(["approved"]);
export const artifactFormatSchema = z.enum(["markdown"]);
export const artifactStorageTypeSchema = z.enum(["file"]);
export const artifactCreatedByTypeSchema = z.enum(["agent", "user", "system"]);

export const listArtifactsQuerySchema = z.object({
  status: artifactStatusSchema.optional(),
  sourceType: z.string().trim().min(1).optional(),
  sourceId: z.string().trim().min(1).optional(),
  limit: z.coerce.number().int().positive().max(200).optional(),
});

export type ListArtifactsQuery = z.infer<typeof listArtifactsQuerySchema>;
