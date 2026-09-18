import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config()

if(!process.env.SESSION_SECRET)throw new Error("SESSION_SECRET is not set in .env");
const SESSION_SECRET = process.env.SESSION_SECRET as string

export interface AuthTokenPayload{
  userId : number,
  email : string
}
export function signToken(payload : AuthTokenPayload){
   return jwt.sign(payload , SESSION_SECRET, { expiresIn: "8h" })
}

export function verifyToken(token : string):AuthTokenPayload{
    return jwt.verify(token,SESSION_SECRET) as unknown as AuthTokenPayload
}