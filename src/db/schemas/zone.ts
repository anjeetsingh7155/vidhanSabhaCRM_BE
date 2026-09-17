import { integer, pgTable, serial, text, varchar } from "drizzle-orm/pg-core";
import { assemblies } from "./assembly";
import { isNotNull } from "drizzle-orm";

export const zone = pgTable("zone",{
    id : serial("id").primaryKey().notNull(),
    assemblyNumber : integer("assembly_number").notNull().references(()=>assemblies.id),
    zoneNo : integer("zone_no").notNull(),
    zoneName: varchar("zone_name",{length:100}).notNull(),
    inchargeName: varchar("incharge_name",{length:150}),
    inchargePhones: text("incharge_phones").array().default([]), 
})