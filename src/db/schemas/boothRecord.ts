import { integer, pgTable, serial, text, varchar } from "drizzle-orm/pg-core";
import { panchayat } from "./panchayat";

export const boothRecords = pgTable("booth_records",{
    id : serial("id").notNull().primaryKey(),
    panchayatId : integer("panchayat_id").notNull().references(()=>panchayat.id),
    boothNo : integer("booth_no").notNull(),
    boothName : varchar("booth_name",{length:150}).notNull(),
    inchargeName : varchar("incharge_name",{length:150}),
    inchargePhones : text("incharge_phones").array().default([]).notNull(),
    flags : text("flags").array().notNull().default([]),
    notesLogged : integer("notes_logged").notNull().default(0),
    openIssues : integer("open_issues").notNull().default(0),
    eventsLogged: integer("events_logged").notNull().default(0),
    totalEntries : integer("total_entries").notNull().default(0),
})