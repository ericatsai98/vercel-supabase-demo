import type { NextApiRequest, NextApiResponse } from "next";
import { serialize } from "cookie";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const { pwd } = req.body || {};
  if (!pwd) return res.status(400).json({ error: "missing password" });

  if (pwd === process.env.RECORDS_ADMIN_PWD) {
    res.setHeader(
      "Set-Cookie",
      serialize("admin_pwd", pwd, {
        path: "/",
        httpOnly: true,   // 避免前端 JS 讀寫，更安全
        sameSite: "lax",
        // secure: true,   // 上線後可打開（https）
        maxAge: 60 * 60 * 24 * 7, // 7 天
      })
    );
    return res.status(200).json({ ok: true });
  }
  return res.status(401).json({ error: "Invalid password" });
}
