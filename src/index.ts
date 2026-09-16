import express, { type Request, type Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { Pool } from "pg";
import { db, testDatabase } from "./db";
import districtsRouter from "./routes/districts";
import { zonesRouter } from "./routes/zone";
import { mandalsRouter } from "./routes/mandals";
import { panchayatsRouter } from "./routes/panchayats";
import { boothsRouter } from "./routes/booths";
const app = express()
dotenv.config()
const port = process.env.port

app.use(cors({ origin: "http://localhost:5173" }));



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