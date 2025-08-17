import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const { pwd } = req.body || {};
  if (!pwd) return res.status(400).json({ error: "missing password" });

  if (pwd === process.env.RECORDS_ADMIN_PWD) {
    const cookieParts = [
      `admin_pwd=${encodeURIComponent(pwd)}`,
      "Path=/",
      "HttpOnly",
      "SameSite=Lax",
      "Max-Age=604800", // 7 天
      // 上線用 HTTPS 時再開啟：
      process.env.NODE_ENV === "production" ? "Secure" : "",
    ].filter(Boolean);

    res.setHeader("Set-Cookie", cookieParts.join("; "));
    return res.status(200).json({ ok: true });
  }

  return res.status(401).json({ error: "Invalid password" });
}
