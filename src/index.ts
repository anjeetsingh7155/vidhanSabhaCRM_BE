import express, { type Request, type Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { testDatabase } from "./db/index.js";
import districtsRouter from "./routes/districts.js";
import { zonesRouter } from "./routes/zone.js";
import { mandalsRouter } from "./routes/mandals.js";
import { panchayatsRouter } from "./routes/panchayats.js";
import { boothsRouter } from "./routes/booths.js";
import { adminLoginRouter } from "./routes/auth.js";
import { authMiddleware } from "./common/middleware/requireAuth.js";
import districtsAdminRouter from "./routes/admin/districts.js";
import assembliesAdminRouter from "./routes/admin/assemblies.js";
import zonesAdminRouter from "./routes/admin/zones.js";
import mandalsAdminRouter from "./routes/admin/mandals.js";
import panchayatsAdminRouter from "./routes/admin/panchayats.js";
import boothsAdminRouter from "./routes/admin/booths.js";
const app = express()
dotenv.config()
const port = process.env.port

app.use(cors({ origin: process.env.FRONTEND_URL?.split(",").map((o) => o.trim()) }));
app.use(express.json());

testDatabase();

app.get("/",(req:Request,res:Response)=>{
res.send("hello the server is live")
})

app.use("/api/districts", districtsRouter);
app.use("/api", zonesRouter);
app.use("/api", mandalsRouter);
app.use("/api", panchayatsRouter);
app.use("/api", boothsRouter);

app.use("/api/auth", adminLoginRouter);
app.use("/api/admin/districts", authMiddleware, districtsAdminRouter);
app.use("/api/admin/assemblies", authMiddleware, assembliesAdminRouter);
app.use("/api/admin/zones", authMiddleware, zonesAdminRouter);
app.use("/api/admin/mandals", authMiddleware, mandalsAdminRouter);
app.use("/api/admin/panchayats", authMiddleware, panchayatsAdminRouter);
app.use("/api/admin/booths", authMiddleware, boothsAdminRouter);

app.listen(port,()=>{
    console.log(`the backend is running on http://localhost:${port}`)
})