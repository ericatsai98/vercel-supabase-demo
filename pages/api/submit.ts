// pages/api/submit.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getAdminClient } from "../../lib/supabaseAdmin";

type Lead = {
  client_name: string;
  phone?: string;
  email?: string;
  area_ping?: number | string | undefined;
  category?: string;
  source?: string;
  notes?: string;
  budget_range?: string;
  add_carpentry?: boolean;
  add_system_furniture?: boolean;
  add_electrical?: boolean;
  add_painting?: boolean;
  add_flooring?: boolean;
};

const P = {
  BASE: Number(process.env.NEXT_PUBLIC_QUOTE_BASE_PRICE) || 80000,
  PER_PING: Number(process.env.NEXT_PUBLIC_QUOTE_PRICE_PER_PING) || 20000,
  CARPENTRY: Number(process.env.NEXT_PUBLIC_QUOTE_CARPENTRY_PER_PING) || 6000,
  SYSTEM: Number(process.env.NEXT_PUBLIC_QUOTE_SYSTEM_PER_PING) || 8000,
  ELECTRICAL: Number(process.env.NEXT_PUBLIC_QUOTE_ELECTRICAL_PER_PING) || 3000,
  PAINTING: Number(process.env.NEXT_PUBLIC_QUOTE_PAINTING_PER_PING) || 1500,
  FLOORING: Number(process.env.NEXT_PUBLIC_QUOTE_FLOORING_PER_PING) || 3500,
};

function calcEstimate(a: number, f: Lead) {
  const area = Math.max(0, Number(a) || 0);
  let t = P.BASE + area * P.PER_PING;
  if (f.add_carpentry)        t += area * P.CARPENTRY;
  if (f.add_system_furniture) t += area * P.SYSTEM;
  if (f.add_electrical)       t += area * P.ELECTRICAL;
  if (f.add_painting)         t += area * P.PAINTING;
  if (f.add_flooring)         t += area * P.FLOORING;
  return Math.round(t);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST")
    return res.status(405).json({ ok: false, error: "Method not allowed" });

  try {
    const body = (req.body || {}) as Lead;
    const payload: Lead = {
      ...body,
      area_ping: body.area_ping ? Number(body.area_ping) : undefined,
    };

    const estimate = calcEstimate(Number(payload.area_ping) || 0, payload);

    const supabase = getAdminClient();
    const { error } = await supabase.from("leads").insert([
      { ...payload, quote_estimate: estimate },
    ]);

    if (error) throw error;

    return res.status(200).json({ ok: true, estimate });
  } catch (err: any) {
    console.error(err);
    return res
      .status(500)
      .json({ ok: false, error: err?.message ?? "Server error" });
  }
}
