# Transcendiverse Approved Artifacts

## Goal

Freeze only approved Paperclip review artifacts and sync those immutable outputs into the Transcendiverse Research vault.

This keeps live review documents editable inside Paperclip while ensuring the vault only ingests approved snapshots.

## Flow

1. A Paperclip approval path reaches an approved state.
2. Paperclip builds a markdown snapshot from the latest issue documents.
3. Paperclip stores the snapshot as an immutable artifact under the Paperclip instance root.
4. Paperclip emits `artifact.created`.
5. The Transcendiverse extension reads the artifact and writes:
   - a raw approved artifact into the vault import area
   - a distilled companion note into the vault synthesis area

## Core Hook Points

Current approval detection is intentionally narrow and additive:

- `server/src/routes/approvals.ts`
  - after `approvalService.approve(...)` returns `applied: true` and `approval.status === "approved"`
- `server/src/routes/issues.ts`
  - after an issue execution decision is recorded with `outcome === "approved"`

Those routes call `artifactService.ensureApprovedSnapshotsForIssueDocuments(...)`.

## Artifact Model

Artifacts are stored in the `artifacts` table with generic fields:

- `companyId`
- `sourceType`
- `sourceId`
- `status`
- `version`
- `format`
- `storageType`
- `storagePath`
- `contentHash`
- `createdByType`
- `createdById`
- `metadata`

Current approved snapshot sources:

- `issue_document`
- `issue_legacy_plan`

## Storage Layout

Paperclip instance storage:

```text
.paperclip/instances/default/artifacts/approved/{companyId}/{sourceType}/{sourceId}/v001.md
```

Recommended Transcendiverse vault outputs:

```text
wiki/sources/internal/paperclip/{year}/{slug}.md
wiki/syntheses/paperclip/{slug}-synthesis.md
```

## Snapshot Format

The raw approved snapshot is self-describing markdown:

- frontmatter with artifact metadata
- source section
- exact approved content
- JSON context metadata

This file is the immutable source of truth.

## Distillation Format

The Transcendiverse extension writes a second markdown note with:

- summary
- key decisions
- actionable insights
- Transcendiverse research relevance
- follow-up link back to the raw approved artifact

The current distillation is deterministic and file-based. It does not mutate canonical doctrine pages.

## Configuration

Use the Paperclip config file:

```json
{
  "extensions": {
    "transcendiverseVaultSync": {
      "enabled": true,
      "vaultRoot": "C:\\Users\\User\\projects\\transcendiverse-research",
      "rawImportDir": "wiki/sources/internal/paperclip",
      "distillationDir": "wiki/syntheses/paperclip",
      "autoWriteRaw": true,
      "autoWriteDistillation": true,
      "autoMergeCanonical": false
    }
  }
}
```

## Upgrade Safety

- Core code stays generic and emits a reusable artifact event seam.
- Transcendiverse logic is isolated under `server/src/extensions/transcendiverse/`.
- Approval routes only contain the minimum call needed to create an approved artifact.
- No upstream plugin-system redesign was introduced.

## Tests

Coverage added for:

- approved document snapshot creation
- content-hash dedupe for repeated approval of the same revision
- version increment when the approved revision changes
- Transcendiverse raw and distilled vault writes
- Transcendiverse ignoring unsupported artifact source types
