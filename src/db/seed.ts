import "dotenv/config";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { eq, inArray } from "drizzle-orm";
import { db } from "./index";
import { districts } from "./schemas/district";
import { assemblies } from "./schemas/assembly";
import { zone } from "./schemas/zone";
import { mandals } from "./schemas/mandal";
import { panchayat } from "./schemas/panchayat";
import { boothRecords } from "./schemas/boothRecord";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface BoothJson {
  boothNo: number;
  boothName: string;
  inchargeName: string | null;
  inchargePhones: string[];
  flags: string[];
}

interface PanchayatJson {
  name: string;
  booths: BoothJson[];
}

interface MandalJson {
  inchargeName: string | null;
  inchargePhones: string[];
  panchayats: PanchayatJson[];
}

interface ZoneJson {
  zoneNo: number;
  zoneName: string;
  inchargeName: string | null;
  inchargePhones: string[];
  mandals: MandalJson[];
}

interface AssemblyJson {
  number: number;
  name: string;
  reservation: "GEN" | "SC" | "ST";
  totalBooths: number;
  blocks: number;
  zones: number;
  flaggedRecords: number;
  notesLogged: number;
  openIssues: number;
  eventsLogged: number;
  totalEntries: number;
  zoneDetails?: ZoneJson[];
}

async function seedZoneDetails(assemblyNumber: number, zoneDetails: ZoneJson[]) {
  // Idempotent: clear any previously-seeded hierarchy for this assembly before
  // re-inserting, so `pnpm seed` stays safe to re-run (mirrors the upsert
  // pattern used for districts/assemblies above, since these tables have no
  // natural unique key of their own to upsert against).
  const existingZones = await db.select({ id: zone.id }).from(zone).where(eq(zone.assemblyNumber, assemblyNumber));
  const zoneIds = existingZones.map((z) => z.id);
  if (zoneIds.length) {
    const existingMandals = await db.select({ id: mandals.id }).from(mandals).where(inArray(mandals.zoneId, zoneIds));
    const mandalIds = existingMandals.map((m) => m.id);
    if (mandalIds.length) {
      const existingPanchayats = await db
        .select({ id: panchayat.id })
        .from(panchayat)
        .where(inArray(panchayat.mandalId, mandalIds));
      const panchayatIds = existingPanchayats.map((p) => p.id);
      if (panchayatIds.length) {
        await db.delete(boothRecords).where(inArray(boothRecords.panchayatId, panchayatIds));
      }
      await db.delete(panchayat).where(inArray(panchayat.mandalId, mandalIds));
    }
    await db.delete(mandals).where(inArray(mandals.zoneId, zoneIds));
  }
  await db.delete(zone).where(eq(zone.assemblyNumber, assemblyNumber));

  let zoneCount = 0;
  let mandalCount = 0;
  let panchayatCount = 0;
  let boothCount = 0;

  for (const z of zoneDetails) {
    const [zoneRow] = await db
      .insert(zone)
      .values({
        assemblyNumber,
        zoneNo: z.zoneNo,
        zoneName: z.zoneName,
        inchargeName: z.inchargeName,
        inchargePhones: z.inchargePhones,
      })
      .returning();
    if (!zoneRow) throw new Error(`Failed to insert zone: ${z.zoneName}`);
    zoneCount++;

    for (const [mi, m] of z.mandals.entries()) {
      const [mandalRow] = await db
        .insert(mandals)
        .values({
          zoneId: zoneRow.id,
          mandalNo: mi + 1,
          inchargeName: m.inchargeName,
          inchagePhones: m.inchargePhones,
        })
        .returning();
      if (!mandalRow) throw new Error(`Failed to insert mandal under zone: ${z.zoneName}`);
      mandalCount++;

      for (const p of m.panchayats) {
        const [panchayatRow] = await db.insert(panchayat).values({ mandalId: mandalRow.id, name: p.name }).returning();
        if (!panchayatRow) throw new Error(`Failed to insert panchayat: ${p.name}`);
        panchayatCount++;

        if (p.booths.length) {
          await db.insert(boothRecords).values(
            p.booths.map((b) => ({
              panchayatId: panchayatRow.id,
              boothNo: b.boothNo,
              boothName: b.boothName,
              inchargeName: b.inchargeName,
              inchargePhones: b.inchargePhones,
              flags: b.flags,
            }))
          );
          boothCount += p.booths.length;
        }
      }
    }
  }

  return { zoneCount, mandalCount, panchayatCount, boothCount };
}

interface DistrictJson {
  district: string;
  headquarters: string;
  assemblies: AssemblyJson[];
}

interface DivisionJson {
  division: string;
  districts: DistrictJson[];
}

interface ChhattisgarhJson {
  divisions: DivisionJson[];
}

async function seed() {
  const filePath = path.join(__dirname, "../data/chhattisgarh_districts_assemblies.json");
  const data: ChhattisgarhJson = JSON.parse(readFileSync(filePath, "utf-8"));

  let districtCount = 0;
  let assemblyCount = 0;
  let hierarchyTotals = { zoneCount: 0, mandalCount: 0, panchayatCount: 0, boothCount: 0 };

  for (const division of data.divisions) {
    for (const d of division.districts) {
      const [row] = await db
        .insert(districts)
        .values({ name: d.district, headquarters: d.headquarters, division: division.division })
        .onConflictDoUpdate({
          target: districts.name,
          set: { headquarters: d.headquarters, division: division.division },
        })
        .returning();
      if (!row) {
        throw new Error(`Failed to upsert district: ${d.district}`);
      }
      districtCount++;

for (const a of d.assemblies) {
  await db
    .insert(assemblies)
    .values({ ...a, id: a.number, districtId: row.id })
    .onConflictDoUpdate({
      target: assemblies.id,
      set: { ...a, id: a.number, districtId: row.id },
    });
  assemblyCount++;

  if (a.zoneDetails && a.zoneDetails.length) {
    const t = await seedZoneDetails(a.number, a.zoneDetails);
    hierarchyTotals.zoneCount += t.zoneCount;
    hierarchyTotals.mandalCount += t.mandalCount;
    hierarchyTotals.panchayatCount += t.panchayatCount;
    hierarchyTotals.boothCount += t.boothCount;
  }
}
      }
    }

  console.log(`✅ Seeded ${districtCount} districts and ${assemblyCount} assemblies`);
  console.log(
    `✅ Seeded ${hierarchyTotals.zoneCount} zones, ${hierarchyTotals.mandalCount} mandals, ${hierarchyTotals.panchayatCount} panchayats, ${hierarchyTotals.boothCount} booth records`
  );
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed");
  console.error(err);
  process.exit(1);
});
