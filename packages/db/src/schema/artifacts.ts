import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { companies } from "./companies.js";

export const artifacts = pgTable(
  "artifacts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    companyId: uuid("company_id").notNull().references(() => companies.id),
    sourceType: text("source_type").notNull(),
    sourceId: text("source_id").notNull(),
    status: text("status").notNull().default("approved"),
    version: integer("version").notNull(),
    title: text("title"),
    format: text("format").notNull().default("markdown"),
    storageType: text("storage_type").notNull().default("file"),
    storagePath: text("storage_path").notNull(),
    contentHash: text("content_hash").notNull(),
    createdByType: text("created_by_type").notNull(),
    createdById: text("created_by_id").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    companyCreatedIdx: index("artifacts_company_created_idx").on(table.companyId, table.createdAt),
    companySourceStatusCreatedIdx: index("artifacts_company_source_status_created_idx").on(
      table.companyId,
      table.sourceType,
      table.sourceId,
      table.status,
      table.createdAt,
    ),
    companySourceStatusVersionUq: uniqueIndex("artifacts_company_source_status_version_uq").on(
      table.companyId,
      table.sourceType,
      table.sourceId,
      table.status,
      table.version,
    ),
    companySourceStatusHashUq: uniqueIndex("artifacts_company_source_status_hash_uq").on(
      table.companyId,
      table.sourceType,
      table.sourceId,
      table.status,
      table.contentHash,
    ),
  }),
);
