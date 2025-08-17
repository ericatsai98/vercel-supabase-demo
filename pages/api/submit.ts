import type { NextApiRequest, NextApiResponse } from "next";
import { getAdminClient } from "../../lib/supabaseAdmin";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed" });
  try {
    const body = req.body || {};
    const payload = {
      client_name: (body.client_name || "").toString().slice(0, 120),
      phone: (body.phone || "").toString().slice(0, 60),
      email: (body.email || "").toString().slice(0, 120),
      area_ping: body.area_ping ? Number(body.area_ping) : null,
      category: (body.category || "").toString().slice(0, 60),
      source: (body.source || "").toString().slice(0, 60),
      notes: (body.notes || "").toString().slice(0, 1000)
    };

    const supabase = getAdminClient();
    const { error } = await supabase.from("leads").insert([payload]);
    if (error) throw error;

    return res.status(200).json({ ok: true });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message || "Server error" });
  }
}
