import { integer, pgTable, serial, text, varchar } from "drizzle-orm/pg-core";
import { zone } from "./zone";

export const mandals = pgTable("mandals",{
    id : serial("id").notNull().primaryKey(),
    zoneId : integer("zone_id").notNull().references(()=>zone.id),
    mandalNo: integer("mandal_no").notNull(),
    inchargeName : varchar("incharge_name",{length:150}),
    inchagePhones : text("incharge_phones").array().notNull().default([])
})