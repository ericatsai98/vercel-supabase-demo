import { useState } from "react";

type Lead = {
  client_name: string;
  phone?: string;
  email?: string;
  area_ping?: number | string;
  category?: string;
  source?: string;
  notes?: string;
};

export default function Home() {
  const [pwd, setPwd] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const UNLOCK_PWD = process.env.NEXT_PUBLIC_DEMO_PWD || "demo123";

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    const form = new FormData(e.currentTarget);
    const data: Lead = Object.fromEntries(form.entries()) as any;

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const out = await res.json();
      if (out && out.ok) {
        setMsg("已送出！資料已寫入資料庫。");
        (e.target as HTMLFormElement).reset();
      } else {
        throw new Error(out?.error || "提交失敗");
      }
    } catch (err: any) {
      setMsg("發生錯誤：" + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Optional: direct Supabase insert (RLS insert-only policy)
  // import { createClient } from "@supabase/supabase-js";
  // const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  // await supabase.from("leads").insert([data]);

  return (
    <div style={styles.wrap}>
      <div style={styles.card as any}>
        <h1>Leads 收單 Demo（Vercel + Supabase）</h1>
        <p style={{opacity:.8}}>此頁會呼叫 <code>/api/submit</code> 寫入 Supabase。</p>

        {!unlocked && (
          <div style={{ marginBottom: 12 }}>
            <label>存取密碼</label>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <input type="password" value={pwd} onChange={(e)=>setPwd(e.target.value)} placeholder="輸入密碼後可使用" />
              <button onClick={()=> setUnlocked(pwd === UNLOCK_PWD)}>解鎖</button>
            </div>
            <div style={{fontSize: 12, opacity: .7}}>（示範用前端密碼，正式請用登入/權限）</div>
          </div>
        )}

        {unlocked && (
          <form onSubmit={onSubmit} style={{marginTop: 12}}>
            <div style={styles.row as any}>
              <div>
                <label>客戶姓名</label>
                <input name="client_name" required />
              </div>
              <div>
                <label>電話</label>
                <input name="phone" />
              </div>
            </div>

            <div style={styles.row as any}>
              <div>
                <label>Email</label>
                <input type="email" name="email" />
              </div>
              <div>
                <label>坪數</label>
                <input type="number" step="0.1" name="area_ping" />
              </div>
            </div>

            <div style={styles.row as any}>
              <div>
                <label>類別</label>
                <select name="category" defaultValue="">
                  <option value="">未指定</option>
                  <option>室內設計</option>
                  <option>維修報修</option>
                  <option>網站開發</option>
                  <option>行銷需求</option>
                </select>
              </div>
              <div>
                <label>來源</label>
                <select name="source" defaultValue="官網">
                  <option>官網</option>
                  <option>FB</option>
                  <option>IG</option>
                  <option>LINE</option>
                  <option>其他</option>
                </select>
              </div>
            </div>

            <label>需求描述</label>
            <textarea name="notes" rows={5} placeholder="請簡述需求與預算"></textarea>

            <button type="submit" disabled={loading} style={{marginTop: 12}}>
              {loading ? "送出中..." : "送出"}
            </button>

            {msg && <div style={{marginTop: 10, padding: 10, borderRadius: 8, background: 'rgba(0,0,0,.05)'}}>{msg}</div>}
          </form>
        )}
      </div>
      <style jsx global>{`
        :root { color-scheme: light dark; }
        body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Noto Sans, Arial, "Microsoft JhengHei", sans-serif; }
        input, select, textarea { width: 100%; padding: 10px; border-radius: 10px; border: 1px solid rgba(140,140,140,.4); }
        button { padding: 10px 16px; border-radius: 10px; border: none; cursor: pointer; }
        label { display:block; margin-top: 12px; font-weight: 600; }
      `}</style>
    </div>
  );
}

const styles = {
  wrap: { maxWidth: 760, margin: "40px auto", padding: "0 16px", lineHeight: 1.6 },
  card: { border: "1px solid rgba(140,140,140,.3)", borderRadius: 14, padding: 20, boxShadow: "0 4px 14px rgba(0,0,0,.06)" },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
} as const;
