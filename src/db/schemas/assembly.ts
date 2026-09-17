import { pgTable, integer, varchar, pgEnum } from "drizzle-orm/pg-core";
import { districts } from "./district";

export const reservationEnum = pgEnum("reservation", ["GEN", "SC", "ST"]);

export const assemblies = pgTable("assemblies", {
  id: integer("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  reservation: reservationEnum("reservation").notNull(),

  totalBooths: integer("total_booths").notNull().default(0),
  blocks: integer("blocks").notNull().default(0),
  zones: integer("zones").notNull().default(0),
  flaggedRecords: integer("flagged_records").notNull().default(0),
  notesLogged: integer("notes_logged").notNull().default(0),
  openIssues: integer("open_issues").notNull().default(0),
  eventsLogged: integer("events_logged").notNull().default(0),
  totalEntries: integer("total_entries").notNull().default(0),

  districtId: integer("district_id")
    .notNull()
    .references(() => districts.id),
});
