// lib/supabaseAdmin.ts
import { createClient } from "@supabase/supabase-js";

export function getAdminClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    // 這個訊息就是你現在看到的錯誤，方便你定位
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  // 後端不需要持久化 session
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
