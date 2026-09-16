import express, { type Request, type Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { Pool } from "pg";
import { db } from "./db";
import districtsRouter from "./routes/districts";
const app = express()
dotenv.config()
const port = process.env.port

app.use(cors({ origin: "http://localhost:5173" }));

async function testDatabase() {
  try {
    const result = await db.execute("SELECT 1");

    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ Database connection failed");
    console.error(error);
  } 
}

testDatabase();

app.get("/",(req:Request,res:Response)=>{
res.send("hello the server is live")
})

app.use("/api/districts", districtsRouter);

app.listen(port,()=>{
    console.log(`the backend is running on http://localhost:${port}`)
})