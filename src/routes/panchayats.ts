import { Router } from "express";
import { panchayat } from "../db/schemas/panchayat.js";
import { zone } from "../db/schemas/zone.js";
import { db } from "../db/index.js";
import { eq } from "drizzle-orm";
import { mandals } from "../db/schemas/mandal.js";
import { assemblies } from "../db/schemas/assembly.js";
import { boothRecords } from "../db/schemas/boothRecord.js";
import { inchargeOf } from "../common/functions/inchargeOf.js";


export const panchayatsRouter:Router = Router()

panchayatsRouter.get("/panchayats/:panchayatId", async (req, res) => {
  const panchayatId = Number(req.params.panchayatId);
  const [Panchayat] = await db.select().from(panchayat).where(eq(panchayat.id, panchayatId));
  if (!Panchayat) return res.status(404).json({ error: "Panchayat not found" });
  const [mandal] = await db.select().from(mandals).where(eq(mandals.id, Panchayat.mandalId));
  const [Zone] = await db.select().from(zone).where(eq(zone.id, mandal!.zoneId));
  const [assembly] = await db.select().from(assemblies).where(eq(assemblies.id, Zone!.assemblyNumber));

  const boothRows = await db.select().from(boothRecords).where(eq(boothRecords.panchayatId, panchayatId));

  res.json({
    assembly: { number: assembly!.id, name: assembly!.name },
    zone: { id: Zone!.id, zoneName: Zone!.zoneName },
    mandal: { id: mandal!.id, mandalNo: mandal!.mandalNo },
    panchayat: { id: Panchayat.id, name: Panchayat.name },
    booths: boothRows.map((b) => ({
      id: b.id, boothNo: b.boothNo, boothName: b.boothName, incharge: inchargeOf(b), flags: b.flags,
    })),
  });
});