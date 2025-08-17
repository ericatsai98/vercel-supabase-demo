import type { NextApiRequest, NextApiResponse } from "next";
import { getAdminClient } from "../../lib/supabaseAdmin";

// 伺服器端正式計算（以 env 為主，沒有就用預設）
function num(v: string | undefined, d: number) {
  const n = Number(v); return Number.isFinite(n) ? n : d;
}
const PRICE = {
  BASE: num(process.env.QUOTE_BASE_PRICE, 80000),
  PER_PING: num(process.env.QUOTE_PRICE_PER_PING, 20000),
  CARPENTRY: num(process.env.QUOTE_CARPENTRY_PER_PING, 6000),
  SYSTEM: num(process.env.QUOTE_SYSTEM_PER_PING, 8000),
  ELECTRICAL: num(process.env.QUOTE_ELECTRICAL_PER_PING, 3000),
  PAINTING: num(process.env.QUOTE_PAINTING_PER_PING, 1500),
  FLOORING: num(process.env.QUOTE_FLOORING_PER_PING, 3500),
};

function calcEstimate(areaPing: any, flags: {
  add_carpentry?: any; add_system_furniture?: any; add_electrical?: any;
  add_painting?: any; add_flooring?: any;
}) {
  const a = Math.max(0, Number(areaPing) || 0);
  let t = PRICE.BASE + a * PRICE.PER_PING;
  if (flags.add_carpentry)       t += a * PRICE.CARPENTRY;
  if (flags.add_system_furniture)t += a * PRICE.SYSTEM;
  if (flags.add_electrical)      t += a * PRICE.ELECTRICAL;
  if (flags.add_painting)        t += a * PRICE.PAINTING;
  if (flags.add_flooring)        t += a * PRICE.FLOORING;
  return Math.round(t);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed" });
  try {
    const b = (req.body || {}) as any;

    // 將 checkbox 類型轉成布林
    const flags = {
      add_carpentry:        !!b.add_carpentry,
      add_system_furniture: !!b.add_system_furniture,
      add_electrical:       !!b.add_electrical,
      add_painting:         !!b.add_painting,
      add_flooring:         !!b.add_flooring,
    };

    const estimate = calcEstimate(b.area_ping, flags);

    const payload = {
      client_name: (b.client_name || "").toString().slice(0, 120),
      phone:       (b.phone || "").toString().slice(0, 60),
      email:       (b.email || "").toString().slice(0, 120),
      area_ping:    b.area_ping ? Number(b.area_ping) : null,
      category:    (b.category || "").toString().slice(0, 60),
      source:      (b.source || "").toString().slice(0, 60),
      notes:       (b.notes || "").toString().slice(0, 1000),

      // 新欄位
      budget_range: (b.budget_range || "").toString().slice(0, 60),
      ...flags,
      quote_estimate: estimate
    };

    const supabase = getAdminClient();
    const { error } = await supabase.from("leads").insert([payload]);
    if (error) throw error;

    return res.status(200).json({ ok: true, estimate });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message || "Server error" });
  }
}
