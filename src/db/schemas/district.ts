import { pgTable, serial, varchar } from "drizzle-orm/pg-core";

export const districts = pgTable("districts", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  headquarters: varchar("headquarters", { length: 100 }).notNull(),
  division: varchar("division", { length: 50 }).notNull(),
});
