import { Router, type Request, type Response } from "express";
import { db } from "../db/index.js";
import { assemblies } from "../db/schemas/assembly.js";
import { eq } from "drizzle-orm";
import { zone } from "../db/schemas/zone.js";
import { mandals } from "../db/schemas/mandal.js";
import { panchayat } from "../db/schemas/panchayat.js";
import { boothRecords } from "../db/schemas/boothRecord.js";
import { inchargeOf } from "../common/functions/inchargeOf.js";

export const zonesRouter: Router = Router();

zonesRouter.get("/assemblies/:assemblyNumber/zones",async (req:Request,res:Response)=>{
const assemblyNumber = Number(req.params.assemblyNumber)
const [assembly] = await db.select().from(assemblies).where(eq(assemblies.id, assemblyNumber));
if(!assembly){
    return res.status(404).json({
        error:"Assembly not found"
    })
}

const zoneRows = await db.select().from(zone).where(eq(zone.assemblyNumber,assemblyNumber))
const mandalRows = await db.select().from(mandals)
const panchayatRows = await db.select().from(panchayat)
const boothRows = await db.select().from(boothRecords)

 const result = zoneRows.map((z) => {
    const zoneMandals = mandalRows.filter((m) => m.zoneId === z.id);
    const zonePanchayats = panchayatRows.filter((p) => zoneMandals.some((m) => m.id === p.mandalId));
    const zoneBooths = boothRows.filter((b) => zonePanchayats.some((p) => p.id === b.panchayatId));
    return {
      id: z.id,
      zoneNo: z.zoneNo,
      zoneName: z.zoneName,
      incharge: inchargeOf({ ...z, inchargePhones: z.inchargePhones ?? [] }),
      boothCount: zoneBooths.length,
      vacantCount: zoneBooths.filter((b) => !b.inchargeName).length,
      missingNumberCount: zoneBooths.filter((b) => b.flags.includes("missing_phone")).length,
      invalidNumberCount: zoneBooths.filter((b) => b.flags.includes("invalid_phone")).length,
    };
  });

  res.json({ assembly: { number: assembly.id, name: assembly.name }, zones: result });
})




zonesRouter.get("/zones/:zoneId", async (req:Request, res:Response) => {
  const zoneId = Number(req.params.zoneId);
  const [Zone] = await db.select().from(zone).where(eq(zone.id, zoneId));
  if (!Zone) return res.status(404).json({ error: "Zone not found" });
  const [assembly] = await db.select().from(assemblies).where(eq(assemblies.id, Zone.assemblyNumber));

  const mandalRows = await db.select().from(mandals).where(eq(mandals.zoneId, zoneId));
  const panchayatRows = await db.select().from(panchayat);
  const boothRows = await db.select().from(boothRecords);

  const mandalList = mandalRows.map((m) => {
    const mPanchayats = panchayatRows.filter((p) => p.mandalId === m.id);
    const mBooths = boothRows.filter((b) => mPanchayats.some((p) => p.id === b.panchayatId));
    return {
      id: m.id,
      mandalNo: m.mandalNo,
      incharge: inchargeOf({
        inchargeName: m.inchargeName,
        inchargePhones: m.inchagePhones,
      }),
      boothCount: mBooths.length,
      vacantCount: mBooths.filter((b: { inchargeName?: string | null }) => !b.inchargeName).length,
    };
  });

  res.json({
    assembly: { number: assembly!.id, name: assembly!.name },
    zone: { id: Zone.id, zoneNo: Zone.zoneNo, zoneName: Zone.zoneName, incharge: inchargeOf({ ...Zone, inchargePhones: Zone.inchargePhones ?? [] }) },
    mandals: mandalList,
  });
});
