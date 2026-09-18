import { Router, type Request, type Response } from "express";
import { db } from "../db";
import { mandals } from "../db/schemas/mandal.js";
import { zone } from "../db/schemas/zone.js";
import { assemblies } from "../db/schemas/assembly.js";
import { eq } from "drizzle-orm";
import { panchayat } from "../db/schemas/panchayat.js";
import { boothRecords } from "../db/schemas/boothRecord.js";
import { inchargeOf } from "../common/functions/inchargeOf.js";
export const mandalsRouter:Router = Router()



mandalsRouter.get("/mandals/:mandalId", async (req: Request, res:Response) => {
  const mandalId = Number(req.params.mandalId);
  const [mandal] = await db.select().from(mandals).where(eq(mandals.id, mandalId));
  if (!mandal) return res.status(404).json({ error: "Mandal not found" });
  const [Zone] = await db.select().from(zone).where(eq(zone.id, mandal.zoneId));
  const [assembly] = await db.select().from(assemblies).where(eq(assemblies.id, Zone!.assemblyNumber));

  const panchayatRows = await db.select().from(panchayat).where(eq(panchayat.mandalId, mandalId));
  const boothRows = await db.select().from(boothRecords);

  const panchayatList = panchayatRows.map((p) => {
    const pBooths = boothRows.filter((b) => b.panchayatId === p.id);
    return { id: p.id, name: p.name, boothCount: pBooths.length, vacantCount: pBooths.filter((b) => !b.inchargeName).length };
  });

  res.json({
    assembly: { number: assembly!.id, name: assembly!.name },
    zone: { id: Zone!.id, zoneName: Zone!.zoneName },
    mandal: { id: mandal.id, mandalNo: mandal.mandalNo, incharge: inchargeOf({ ...mandal, inchargePhones: mandal.inchagePhones }) },
    panchayats: panchayatList,
  });
});

