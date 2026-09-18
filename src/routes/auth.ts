import { Router, type Request, type Response } from "express";
import bcrypt from "bcrypt";
import { signToken } from "../common/lib/jwt";

export const adminLoginRouter: Router = Router();

adminLoginRouter.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminHash = process.env.ADMIN_PASSWORD_HASH;
  if (!adminEmail || !adminHash) {
    console.error("ADMIN_EMAIL / ADMIN_PASSWORD_HASH not set in .env");
    return res.status(500).json({ error: "Admin login is not configured" });
  }

  if (email !== adminEmail || !(await bcrypt.compare(password, adminHash))) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const token = signToken({ userId: 1, email: adminEmail });
  res.json({ token, user: { id: 1, name: "Admin", email: adminEmail } });
});
