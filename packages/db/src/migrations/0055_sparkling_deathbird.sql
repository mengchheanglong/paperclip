CREATE TABLE "artifacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"source_type" text NOT NULL,
	"source_id" text NOT NULL,
	"status" text DEFAULT 'approved' NOT NULL,
	"version" integer NOT NULL,
	"title" text,
	"format" text DEFAULT 'markdown' NOT NULL,
	"storage_type" text DEFAULT 'file' NOT NULL,
	"storage_path" text NOT NULL,
	"content_hash" text NOT NULL,
	"created_by_type" text NOT NULL,
	"created_by_id" text NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "artifacts" ADD CONSTRAINT "artifacts_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "artifacts_company_created_idx" ON "artifacts" USING btree ("company_id","created_at");--> statement-breakpoint
CREATE INDEX "artifacts_company_source_status_created_idx" ON "artifacts" USING btree ("company_id","source_type","source_id","status","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "artifacts_company_source_status_version_uq" ON "artifacts" USING btree ("company_id","source_type","source_id","status","version");--> statement-breakpoint
CREATE UNIQUE INDEX "artifacts_company_source_status_hash_uq" ON "artifacts" USING btree ("company_id","source_type","source_id","status","content_hash");
