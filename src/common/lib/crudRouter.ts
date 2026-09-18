import { Router, type Request, type Response } from "express";
import { eq, type AnyColumn } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import { db } from "../../db";

interface CrudConfig {
  table: PgTable;
  idColumn: AnyColumn;
  requiredFields: string[];
  filterColumn?: AnyColumn;
}

function assertFields(body: Record<string, unknown>, required: string[]) {
  const missing = required.filter((f) => body[f] === undefined || body[f] === null || body[f] === "");
  if (missing.length) throw new Error(`Missing required field(s): ${missing.join(", ")}`);
}

export function createCrudRouter({ table, idColumn, requiredFields, filterColumn }: CrudConfig): Router {
  const router = Router();
  // Cast once to `any` here so the whole fluent chain below stays untyped consistently —
  // mixing `as any` only at the `.from()`/`.insert()` call still leaves drizzle trying (and
  // failing) to infer a real row type through `.where()`/`.returning()`, which surfaces as
  // "must have a [Symbol.iterator]()" errors on destructuring.
  const anyDb: any = db;

  router.get("/", async (req: Request, res: Response) => {
    if (filterColumn && req.query.parentId) {
      const rows = await anyDb.select().from(table).where(eq(filterColumn, Number(req.query.parentId)));
      return res.json(rows);
    }
    const rows = await anyDb.select().from(table);
    res.json(rows);
  });

  router.get("/:id", async (req: Request, res: Response) => {
    const [row] = await anyDb.select().from(table).where(eq(idColumn, Number(req.params.id)));
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(row);
  });

  router.post("/", async (req: Request, res: Response) => {
    try {
      assertFields(req.body ?? {}, requiredFields);
      const [row] = await anyDb.insert(table).values(req.body).returning();
      res.status(201).json(row);
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : "Invalid request" });
    }
  });

  router.put("/:id", async (req: Request, res: Response) => {
    const [row] = await anyDb
      .update(table)
      .set(req.body ?? {})
      .where(eq(idColumn, Number(req.params.id)))
      .returning();
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(row);
  });

  router.delete("/:id", async (req: Request, res: Response) => {
    try {
      const [row] = await anyDb.delete(table).where(eq(idColumn, Number(req.params.id))).returning();
      if (!row) return res.status(404).json({ error: "Not found" });
      res.json({ success: true });
    } catch (err: any) {
      // Drizzle wraps the raw pg error as DrizzleQueryError, with the real Postgres
      // error (and its .code) on `.cause`, not on the thrown error itself.
      if (err?.code === "23503" || err?.cause?.code === "23503") {
        return res.status(409).json({ error: "Cannot delete — other records still reference this. Delete those first." });
      }
      res.status(500).json({ error: "Delete failed" });
    }
  });

  return router;
}
