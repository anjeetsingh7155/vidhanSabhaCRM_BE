import type { Request, Response, NextFunction } from "express";
import { verifyToken, type AuthTokenPayload  } from "../lib/jwt";

declare global {
  namespace Express {
    interface Request {
      user?: AuthTokenPayload;
    }
  }
}


export function authMiddleware(req : Request , res: Response ,next : NextFunction ){
    const header = req.headers.authorization
    if(!header?.startsWith("Bearer ")){
      return res.status(401).json({ error: "Missing or invalid Authorization header" })
    }
    try {
      req.user = verifyToken(header.slice(7));
      next();
    } catch {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
}