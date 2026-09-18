import express, { type Request, type Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { testDatabase } from "./db";
import districtsRouter from "./routes/districts.js";
import { zonesRouter } from "./routes/zone.js";
import { mandalsRouter } from "./routes/mandals.js";
import { panchayatsRouter } from "./routes/panchayats.js";
import { boothsRouter } from "./routes/booths.js";
const app = express()
dotenv.config()
const port = process.env.port

app.use(cors({ origin: process.env.FRONTEND_URL }));



testDatabase();

app.get("/",(req:Request,res:Response)=>{
res.send("hello the server is live")
})

app.use("/api/districts", districtsRouter);
app.use("/api", zonesRouter);
app.use("/api", mandalsRouter);
app.use("/api", panchayatsRouter);
app.use("/api", boothsRouter);

app.listen(port,()=>{
    console.log(`the backend is running on http://localhost:${port}`)
})