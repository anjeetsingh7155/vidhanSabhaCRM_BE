import { integer, pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { mandals } from "./mandal.js";

export const panchayat = pgTable("panchayat",{
    id: serial("id").notNull().primaryKey(),
    mandalId : integer('mandal_id').notNull().references(()=>mandals.id),
    name: varchar("name",{length:150}).notNull()
}) 