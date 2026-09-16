import { Router } from "express";
import { panchayat } from "../db/schemas/panchayat";
import { zone } from "../db/schemas/zone";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { mandals } from "../db/schemas/mandal";
import { assemblies } from "../db/schemas/assembly";
import { boothRecords } from "../db/schemas/boothRecord";
import { inchargeOf } from "../common/functions/inchargeOf";


export const panchayatsRouter:Router = Router()

panchayatsRouter.get("/panchayats/:panchayatId", async (req, res) => {
  const panchayatId = Number(req.params.panchayatId);
  const [Panchayat] = await db.select().from(panchayat).where(eq(panchayat.id, panchayatId));
  if (!Panchayat) return res.status(404).json({ error: "Panchayat not found" });
  const [mandal] = await db.select().from(mandals).where(eq(mandals.id, panchayat.mandalId));
  const [Zone] = await db.select().from(zone).where(eq(zone.id, mandal!.zoneId));
  const [assembly] = await db.select().from(assemblies).where(eq(assemblies.number, Zone!.assemblyNumber));

  const boothRows = await db.select().from(boothRecords).where(eq(boothRecords.panchayatId, panchayatId));

  res.json({
    assembly: { number: assembly!.number, name: assembly!.name },
    zone: { id: Zone!.id, zoneName: Zone!.zoneName },
    mandal: { id: mandal!.id, mandalNo: mandal!.mandalNo },
    panchayat: { id: Panchayat.id, name: Panchayat.name },
    booths: boothRows.map((b) => ({
      id: b.id, boothNo: b.boothNo, boothName: b.boothName, incharge: inchargeOf(b), flags: b.flags,
    })),
  });
});