import "dotenv/config";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { db } from "./index";
import { districts } from "./schemas/district";
import { assemblies } from "./schemas/assembly";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
          .values({ ...a, districtId: row.id })
          .onConflictDoUpdate({
            target: assemblies.id,
            set: { ...a, districtId: row.id },
          });
        assemblyCount++;
      }
    }
  }

  console.log(`✅ Seeded ${districtCount} districts and ${assemblyCount} assemblies`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed");
  console.error(err);
  process.exit(1);
});
