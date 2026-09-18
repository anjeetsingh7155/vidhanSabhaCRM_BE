import { Router, type Request, type Response } from "express";
import { db } from "../db/index.js";
import { districts } from "../db/schemas/district.js";
import { assemblies } from "../db/schemas/assembly.js";

const router: ReturnType<typeof Router> = Router();

router.get("/", async (req: Request, res : Response) => {
  try {
    const districtRows = await db.select().from(districts);
    const assemblyRows = await db.select().from(assemblies);

    const divisionOrder: string[] = [];
    const districtsByDivision = new Map<string, typeof districtRows>();
    for (const d of districtRows) {
      if (!districtsByDivision.has(d.division)) {
        districtsByDivision.set(d.division, []);
        divisionOrder.push(d.division);
      }
      districtsByDivision.get(d.division)!.push(d);
    }

   const divisions= divisionOrder.map((division) => ({
  division,
  districts: districtsByDivision.get(division)!.map((d) => ({
    district: d.name,
    headquarters: d.headquarters,
    assemblies: assemblyRows
      .filter((a) => a.districtId === d.id)
      .map((a) => ({
        number: a.id,
        name: a.name,
        reservation: a.reservation,
        totalBooths: a.totalBooths,
        blocks: a.blocks,
        zones: a.zones,
        flaggedRecords: a.flaggedRecords,
        notesLogged: a.notesLogged,
        openIssues: a.openIssues,
        eventsLogged: a.eventsLogged,
        totalEntries: a.totalEntries,
      })),
  })),
}));

    res.json({
      state: "Chhattisgarh",
      totalDistricts: districtRows.length,
      totalAssemblyConstituencies: assemblyRows.length,
      asOf: "2023 Vidhan Sabha delimitation + 2022 district reorganization",
      divisions,
    });
  } catch (error) {
    console.error("Failed to load districts", error);
    res.status(500).json({ error: "Failed to load districts" });
  }
});

export default router;
