import { Router } from "express";
import type { Db } from "@paperclipai/db";
import { listArtifactsQuerySchema } from "@paperclipai/shared";
import { artifactService } from "../services/artifacts.js";
import { assertCompanyAccess } from "./authz.js";

export function artifactRoutes(db: Db) {
  const router = Router();
  const svc = artifactService(db);

  router.get("/companies/:companyId/artifacts", async (req, res) => {
    const companyId = req.params.companyId as string;
    assertCompanyAccess(req, companyId);

    const parsed = listArtifactsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid artifact query", details: parsed.error.issues });
      return;
    }

    const rows = await svc.list(companyId, parsed.data);
    res.json(rows);
  });

  router.get("/artifacts/:id", async (req, res) => {
    const artifact = await svc.getById(req.params.id as string);
    if (!artifact) {
      res.status(404).json({ error: "Artifact not found" });
      return;
    }
    assertCompanyAccess(req, artifact.companyId);
    res.json(artifact);
  });

  router.get("/artifacts/:id/content", async (req, res) => {
    try {
      const { artifact, content } = await svc.readContent(req.params.id as string);
      assertCompanyAccess(req, artifact.companyId);
      res.setHeader("Content-Type", "text/markdown; charset=utf-8");
      res.send(content);
    } catch (error) {
      if (error && typeof error === "object" && "status" in error && (error as { status?: number }).status === 404) {
        res.status(404).json({ error: "Artifact not found" });
        return;
      }
      throw error;
    }
  });

  return router;
}
