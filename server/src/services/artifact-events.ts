import type { ArtifactCreatedEvent } from "@paperclipai/shared";

export type ArtifactCreatedHandler = (event: ArtifactCreatedEvent) => Promise<void> | void;

const artifactCreatedHandlers = new Map<string, ArtifactCreatedHandler>();

export function registerArtifactCreatedHandler(id: string, handler: ArtifactCreatedHandler) {
  artifactCreatedHandlers.set(id, handler);
  return () => {
    removeArtifactCreatedHandler(id, handler);
  };
}

export function removeArtifactCreatedHandler(id: string, handler?: ArtifactCreatedHandler) {
  if (handler && artifactCreatedHandlers.get(id) !== handler) return;
  artifactCreatedHandlers.delete(id);
}

export function clearArtifactCreatedHandlers() {
  artifactCreatedHandlers.clear();
}

export async function emitArtifactCreated(event: ArtifactCreatedEvent) {
  const errors: Array<{ handlerId: string; error: unknown }> = [];

  await Promise.all(
    Array.from(artifactCreatedHandlers.entries()).map(async ([handlerId, handler]) => {
      try {
        await handler(event);
      } catch (error) {
        errors.push({ handlerId, error });
      }
    }),
  );

  if (errors.length > 0) {
    throw new AggregateError(
      errors.map(({ error }) => error),
      `artifact.created handlers failed: ${errors.map(({ handlerId }) => handlerId).join(", ")}`,
    );
  }
}
