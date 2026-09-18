import { Router, type Request, type Response } from "express";
import { boothRecords } from "../db/schemas/boothRecord.js";
import { db } from "../db/index.js";
import { eq } from "drizzle-orm";
import { panchayat } from "../db/schemas/panchayat.js";
import { mandals } from "../db/schemas/mandal.js";
import { zone } from "../db/schemas/zone.js";
import { assemblies } from "../db/schemas/assembly.js";
import { inchargeOf } from "../common/functions/inchargeOf.js";
export const boothsRouter:Router = Router()




boothsRouter.get("/booths/:boothId", async (req:Request, res:Response) => {
  const boothId = Number(req.params.boothId);
  const [booth] = await db.select().from(boothRecords).where(eq(boothRecords.id, boothId));
  if (!booth) return res.status(404).json({ error: "Booth not found" });
  const [Panchayat] = await db.select().from(panchayat).where(eq(panchayat.id, booth.panchayatId));
  const [mandal] = await db.select().from(mandals).where(eq(mandals.id, Panchayat!.mandalId));
  const [Zone] = await db.select().from(zone).where(eq(zone.id, mandal!.zoneId));
  const [assembly] = await db.select().from(assemblies).where(eq(assemblies.id, Zone!.assemblyNumber));

  res.json({
    assembly: { number: assembly!.id, name: assembly!.name },
    zone: { id: Zone!.id, zoneName: Zone!.zoneName },
    mandal: { id: mandal!.id, mandalNo: mandal!.mandalNo },
    panchayat: { id: Panchayat!.id, name: Panchayat!.name },
    booth: {
      id: booth.id, boothNo: booth.boothNo, boothName: booth.boothName,
      incharge: inchargeOf(booth), flags: booth.flags,
      notesLogged: booth.notesLogged, openIssues: booth.openIssues, eventsLogged: booth.eventsLogged, totalEntries: booth.totalEntries,
    },
  });
});
